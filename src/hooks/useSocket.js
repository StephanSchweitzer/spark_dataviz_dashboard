import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const useSocket = (url) => {
    const [socketData, setSocketData] = useState({ header: '', text: '', data: [] });

    useEffect(() => {
        const socket = io(url);

        socket.on('FromAPI', (newData) => {
            if (newData && typeof newData === 'object') {
                setSocketData(newData);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [url]);

    return socketData;
};

export default useSocket;
