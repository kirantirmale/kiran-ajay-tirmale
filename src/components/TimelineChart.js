import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import data from '../data.json';  // Import the data from JSON
import users from '../users.json';  // Import the users from JSON

const TimelineChart = () => {
    const [view, setView] = useState('Month'); // Current view filter
    const [filteredData, setFilteredData] = useState([]);
    const [days, setDays] = useState([]); // To store unique days

    const handleFilterChange = (newView) => {
        setView(newView);
        filterData(newView);
    };

    const filterData = (view) => {
        const now = new Date();
        let rangeStart, rangeEnd;

        switch (view) {
            case 'Month':
                rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
                rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case '1 Week':
                rangeStart = new Date(now);
                rangeStart.setDate(now.getDate() - 7);
                rangeEnd = now;
                break;
            case '1 Day':
                rangeStart = new Date(now);
                rangeStart.setHours(0, 0, 0, 0);
                rangeEnd = new Date(rangeStart);
                rangeEnd.setHours(23, 59, 59, 999);
                break;
            case 'Previous':
                rangeStart = new Date(now);
                rangeStart.setDate(now.getDate() - 14); // Two weeks before today
                rangeEnd = now;
                break;
            case 'Next':
                rangeStart = new Date(now);
                rangeStart.setDate(now.getDate() + 7); // One week in the future
                rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            default:
                break;
        }

        // Filter layers based on time range
        const filtered = data.layers.map(layer => ({
            ...layer,
            layers: layer.layers.filter(item => {
                const start = new Date(item.startDate);
                return start >= rangeStart && start <= rangeEnd;
            }),
        })).filter(layer => layer.layers.length > 0);

        setFilteredData(filtered);

        // Extract unique days
        const uniqueDays = new Set();
        filtered.forEach(layer => {
            layer.layers.forEach(item => {
                const date = new Date(item.startDate).toLocaleDateString(); // Use locale date format
                uniqueDays.add(date);
            });
        });

        setDays(Array.from(uniqueDays)); // Store unique days
    };

    useEffect(() => {
        filterData(view);
    }, [view]);

    // Prepare data for the chart
    const chartData = {
        labels: days, // Display days on the X-axis
        datasets: users.users.map(user => ({
            label: user.name,
            data: days.map(day => {
                // Count the number of entries for the user on each day
                return filteredData.reduce((count, layer) => {
                    const dayEntries = layer.layers.filter(item => item.userId === user.id && new Date(item.startDate).toLocaleDateString() === day);
                    return count + dayEntries.length;
                }, 0);
            }),
            backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        })),
    };

    return (
        <div className="p-5 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                {/* Button Group */}
                <div className="flex space-x-2">
                    <button
                        className={`px-4 py-2 rounded-md transition ${view === 'Today' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}
                        onClick={() => handleFilterChange('Today')}
                    >
                        Today
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md transition ${view === 'Previous' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}
                        onClick={() => handleFilterChange('Previous')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md transition ${view === 'Next' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}`}
                        onClick={() => handleFilterChange('Next')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                {/* Options as Buttons */}
                <div className="inline-flex rounded-md shadow-sm" role="group">
                    {['1 Day', '2 Days', '1 Week', '2 Weeks', 'Month'].map((option, index) => (
                        <button
                            key={option}
                            type="button"
                            className={`px-4 py-2 text-sm font-medium border ${view === option ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-100 hover:text-blue-700'} ${index === 0 ? 'rounded-l-lg' : ''} ${index === 4 ? 'rounded-r-lg' : ''}`}
                            onClick={() => handleFilterChange(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-4 shadow-md rounded-md">
                {/* Chart */}
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        scales: {
                            x: { title: { display: true, text: 'Days' } },
                            y: { title: { display: true, text: 'Entries' } },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default TimelineChart;
