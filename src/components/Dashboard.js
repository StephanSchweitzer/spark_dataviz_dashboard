import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
                    try {
                        const json = JSON.parse(reader.result);
                        setBatchData(prevData => [...prevData, { timestamp: json.batchTimestamp, total: json.totalMessages }]);
                        setHatefulPercentage(json.hatefulMessagesPercentage);
                        setOffenders(Object.entries(json.frequentHatefulUsers).map(([user, count]) => ({ user, count })));
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
        <div>
            <h1>WebSocket Dashboard</h1>
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
            <h2>Top Offenders</h2>
            <table border="1">
                <thead>
                <tr>
                    <th>User</th>
                    <th>Hateful Messages</th>
                </tr>
                </thead>
                <tbody>
                {offenders.map((offender, index) => (
                    <tr key={index}>
                        <td>{offender.user}</td>
                        <td>{offender.count}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;

