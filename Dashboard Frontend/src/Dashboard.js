import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import './App.css';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border-radius: 10px;
`;

const TableHead = styled.thead`
  font-weight: bold;
  text-align: center;
`;

const TableBody = styled.tbody`
  font-size: 15px;
  text-align: center;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

const TableCell = styled.td`
  padding: 8px;
`;

const Dropdown = styled.select`
  width: 100%;
`;

const Dashboard = () => {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [lectures, setLectures] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://vedantk3.pythonanywhere.com/api/schedule');
      setSchedule(response.data.schedule);
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      if (response.data.schedule.hasOwnProperty(today)) {
        setTodaySchedule(response.data.schedule[today]);
        // Collect all unique lecture names into a set
        const lectureSet = new Set();
        Object.values(response.data.schedule).forEach(daySchedule => {
          daySchedule.forEach(item => {
            lectureSet.add(item.lecture); // Add each lecture to the set
          });
        });

        // Convert the set to an array and update state
        setLectures(Array.from(lectureSet));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching data. Please try again later.');
    }
  };

  const handleEdit = async (id, newLecture, day) => {
    try {
      const response = await axios.put(`https://vedantk3.pythonanywhere.com/api/update`, {
        day: day,
        id: id,
        lecture: newLecture
      });
      console.log('Lecture updated successfully:', response.data);
      // Refresh data after update
      fetchData();
    } catch (error) {
      console.error('Error updating lecture:', error);
      setError('Error updating lecture. Please try again.');
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Card>
      <Container>
        <h1>Smart Bell Dashboard 🎛️</h1>
      </Container>
      <Container>
        <h2>
          Today's Date 📅:{' '}
          <span>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </h2>
      </Container>
      {todaySchedule.length === 0 ? (
        <Container>
          <p>No schedule available for today.</p>
        </Container>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Lecture</TableCell>
              <TableCell>Select Lecture</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todaySchedule.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.start_time}</TableCell>
                <TableCell>{item.end_time}</TableCell>
                <TableCell>{item.lecture}</TableCell>
                <TableCell>
                  <Dropdown
                    value={item.lecture}
                    onChange={(e) => {
                      const newLecture = e.target.value;
                      handleEdit(item.id, newLecture, today);
                    }}
                  >
                    {lectures.map((lecture) => (
                      <option key={lecture} value={lecture}>
                        {lecture}
                      </option>
                    ))}
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};

export default Dashboard;
