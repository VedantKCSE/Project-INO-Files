import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import moment from 'moment';

export default function App() {
  const [schedule, setSchedule] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [nextLecture, setNextLecture] = useState(null);

  useEffect(() => {
    fetch('https://vedantk3.pythonanywhere.com/api/today')
      .then(response => response.json())
      .then(data => {
        setSchedule(data.schedule);
        findCurrentAndNextLectures(data.schedule);
      })
      .catch(error => console.error('Error fetching schedule:', error));
  }, []);

  const findCurrentAndNextLectures = (schedule) => {
    const now = moment();
    let current = null;
    let next = null;
    for (let i = 0; i < schedule.length; i++) {
      const lectureStart = moment(schedule[i].start_time, 'hh:mm A');
      const lectureEnd = moment(schedule[i].end_time, 'hh:mm A');
      if (now.isBetween(lectureStart, lectureEnd)) {
        current = schedule[i];
        next = schedule[i + 1] || null;
        break;
      } else if (now.isBefore(lectureStart)) {
        next = schedule[i];
        break;
      }
    }
    setCurrentLecture(current);
    setNextLecture(next);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.lectureCell]}>{item.lecture}</Text>
      <Text style={[styles.cell, styles.timeCell]}>{item.start_time} - {item.end_time}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.row, styles.tableHeader]}>
      <Text style={[styles.cell, styles.headerCell]}>Time</Text>
      <Text style={[styles.cell, styles.headerCell]}>Lecture</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.currentNextContainer}>
      <Text style={styles.currentNextHeader}>Current Lecture:</Text>
      {currentLecture ? (
        <Text style={styles.currentNextText}>{currentLecture.lecture} ({currentLecture.start_time} - {currentLecture.end_time})</Text>
      ) : (
        <Text style={styles.currentNextText}>No current lecture</Text>
      )}
      <Text style={styles.currentNextHeader}>Next Lecture:</Text>
      {nextLecture ? (
        <Text style={styles.currentNextText}>{nextLecture.lecture} ({nextLecture.start_time} - {nextLecture.end_time})</Text>
      ) : (
        <Text style={styles.currentNextText}>No next lecture</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SBLS</Text>
      <Text style={styles.headers}>Today's Schedule</Text>
      <FlatList
        data={schedule}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.scrollView}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fbe7',
    paddingTop: 50,
  },
  scrollView: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: -10,
    padding: -20,
    color: '#ff9800', // Orange color
  },
  headers: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: 'black', // Orange color
  },
  table: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ff9800', // Orange color
    borderRadius: 10,
  },
  headerCell: {
    flex: 1,
    padding: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fafafa',
    paddingVertical: 10,
    borderRadius: 10,
  },
  lectureCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: '#ff9800', // Orange color
  },
  timeCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: '#00796b', // Teal color
  },
  currentNextContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  currentNextHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#ff9800', // Orange color
  },
  currentNextText: {
    fontSize: 18,
    marginVertical: 10,
    color: '#004d40',
  },
});

