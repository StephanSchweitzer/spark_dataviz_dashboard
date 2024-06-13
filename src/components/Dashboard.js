import React, { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import { ScatterChart, Scatter, CartesianGrid, Tooltip, Legend, XAxis, YAxis } from 'recharts';

const Dashboard = () => {
    const { header, text, data } = useSocket('http://localhost:3001');
    const [clientSideData, setClientSideData] = useState([]);

    useEffect(() => {
        setClientSideData(data);
    }, [data]);

    return (
        <div>
            {typeof header === 'string' && <h1>{header}</h1>}
            {typeof text === 'string' && <p>{text}</p>}

            <ScatterChart
                width={800}
                height={400}
                margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                }}
            >
                <CartesianGrid />
                <XAxis
                    type="number"
                    dataKey="value"
                    name="Value"
                    unit=""
                    domain={[1, 100]} // Set domain for Value axis
                />
                <YAxis
                    type="number"
                    dataKey="id"
                    name="ID"
                    domain={[1, 10]} // Set domain for ID axis
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Data Points" data={clientSideData} fill="#8884d8" />
                <Legend />
            </ScatterChart>
        </div>
    );
};

export default Dashboard;
