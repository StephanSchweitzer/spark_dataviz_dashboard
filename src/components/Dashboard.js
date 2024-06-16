import React, { useEffect, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography
} from '@mui/material';

const Dashboard = () => {
    const [batchData, setBatchData] = useState([]);
    const [hatefulPercentage, setHatefulPercentage] = useState(0);
    const [offenders, setOffenders] = useState([]);
    const [totalMessages, setTotalMessages] = useState([]);

    useEffect(() => {
        const socket = new WebSocket('ws://172.22.134.31:3001');

        socket.onopen = () => {
            console.log('WebSocket connection opened');
        };

        socket.onmessage = (event) => {
            if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    console.log(reader.result);
                    try {
                        const json = JSON.parse(reader.result);
                        setBatchData(prevData => [
                            ...prevData,
                            {
                                timestamp: new Date(json.timestamp).toLocaleString(),
                                total: json.batchSize
                            }
                        ]);
                        setHatefulPercentage(json.hateSpeechRatio);
                        const sortedOffenders = Object.entries(json.top5Users)
                            .map(([user, count]) => ({ user, count }))
                            .sort((a, b) => b.count - a.count); // Sort offenders by count in descending order
                        setOffenders(sortedOffenders);
                        setTotalMessages(json.totalMessages);
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                };
                reader.readAsText(event.data);
            } else {
                console.log('Received:', event.data);
            }
        };

        socket.onclose = (event) => {
            console.log('WebSocket connection closed', event);
        };

        socket.onerror = (event) => {
            console.error('WebSocket error observed:', event);
        };

        return () => socket.close();
    }, []);

    const pieData = [
        { name: 'Hateful', value: hatefulPercentage },
        { name: 'Non-Hateful', value: 100 - hatefulPercentage },
    ];

    const COLORS = ['#FF0000', '#008000'];

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                WebSocket Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={3}>
                        <Typography variant="h6" align="center" gutterBottom>
                            Messages Over Time
                        </Typography>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <LineChart data={batchData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Paper elevation={3} style={{ flex: 1, marginRight: '10px' }}>
                            <Typography variant="h6" align="center" gutterBottom>
                                Hateful vs Non-Hateful Messages
                            </Typography>
                            <div style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Paper>
                        <Paper elevation={3} style={{ flex: 1, marginLeft: '10px' }}>
                            <Typography variant="h6" align="center" gutterBottom>
                                Top Offenders
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell align="right">Hateful Messages</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {offenders.map((offender, index) => (
                                            <TableRow key={index}>
                                                <TableCell component="th" scope="row">
                                                    {offender.user}
                                                </TableCell>
                                                <TableCell align="right">{offender.count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </div>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
