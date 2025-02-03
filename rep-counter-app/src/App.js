import './styles.css';
import React, { useState, useEffect, useMemo } from 'react';

const loadExercises = () => {
  const savedExercises = localStorage.getItem('exercises');
  if (savedExercises) {
    return JSON.parse(savedExercises);
  } else {
    return [
      {
        exerciseName: 'Smile Exercise',
        reps: 10,
        time: 30,
        sets: 3,
        breakTime: 60,
      },
    ];
  }
};

const saveExercises = (exercises) => {
  localStorage.setItem('exercises', JSON.stringify(exercises));
};

function App() {
  const [exercises, setExercises] = useState(loadExercises());
  const [exerciseName, setExerciseName] = useState('');
  const [reps, setReps] = useState('');
  const [time, setTime] = useState('');
  const [sets, setSets] = useState('');
  const [breakTime, setBreakTime] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [breakRemaining, setBreakRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isExerciseComplete, setIsExerciseComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // const shortBeep = new Audio(`${process.env.PUBLIC_URL}/audio/short-beep-tone-47916.mp3`);
  // const longBeep = new Audio(`${process.env.PUBLIC_URL}/audio/censor-beep-88052.mp3`);

  const shortBeep = useMemo(() => new Audio(`${process.env.PUBLIC_URL}/audio/short-beep-tone-47916.mp3`), []);
  const longBeep = useMemo(() => new Audio(`${process.env.PUBLIC_URL}/audio/censor-beep-88052.mp3`), []);

  const addExercise = () => {
    if (exerciseName && reps && time && sets && breakTime) {
      const newExercise = {
        exerciseName,
        reps: parseInt(reps),
        time: parseInt(time),
        sets: parseInt(sets),
        breakTime: parseInt(breakTime),
      };
      const updatedExercises = [...exercises, newExercise];
      setExercises(updatedExercises);
      saveExercises(updatedExercises);
      setExerciseName('');
      setReps('');
      setTime('');
      setSets('');
      setBreakTime('');
    }
  };

  const removeExercise = (index) => {
    const updatedExercises = exercises.filter((_, i) => i !== index);
    setExercises(updatedExercises);
    saveExercises(updatedExercises);
  };

   const startTimer = () => {
    if (!isMuted) {
      longBeep.play();
    }
    if (!isExerciseComplete) {
      setIsTimerRunning(true);
      setTimeRemaining(exercises[currentExerciseIndex].time);
      setIsExerciseComplete(false);
    }
    else {
      setIsTimerRunning(true);
      setCurrentRep(1);
      setCurrentSet(1);
      setTimeRemaining(exercises[currentExerciseIndex].time);
      setIsExerciseComplete(false);
    }
    
  };

  useEffect(() => {
    let timer;

    if (isTimerRunning && timeRemaining > 0 && !isOnBreak) {
      
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !isOnBreak) {
      if (currentRep < exercises[currentExerciseIndex].reps) {
        
        setCurrentRep(currentRep + 1);
        setTimeRemaining(exercises[currentExerciseIndex].time);
        if (!isMuted) {
          shortBeep.play();
        }
      } else if (currentSet < exercises[currentExerciseIndex].sets) {
        setIsOnBreak(true);
        setBreakRemaining(exercises[currentExerciseIndex].breakTime);
        if (!isMuted) {
          longBeep.play();
        }
      } else {
        setIsTimerRunning(false);
        setIsExerciseComplete(true);
        if (!isMuted) {
          longBeep.play();
        }
      }
    } else if (isOnBreak && breakRemaining > 0) {
      timer = setInterval(() => {
        setBreakRemaining((prevBreakTime) => prevBreakTime - 1);
      }, 1000);
    } else if (breakRemaining === 0 && isOnBreak) {
      setIsOnBreak(false);
      setCurrentSet(currentSet + 1);
      setCurrentRep(1);
      setTimeRemaining(exercises[currentExerciseIndex].time);
      if (!isMuted) {
        longBeep.play();
      }
    }

    return () => clearInterval(timer);
  }, [isTimerRunning, timeRemaining, currentRep, currentSet, currentExerciseIndex, exercises, isOnBreak, breakRemaining, isMuted, shortBeep, longBeep]);

  const continueExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentRep(1);
      setCurrentSet(1);
      setTimeRemaining(exercises[currentExerciseIndex + 1].time);
      setIsExerciseComplete(false);
    } else {
      setCurrentExerciseIndex(0);
      setCurrentRep(1);
      setCurrentSet(1);
      setTimeRemaining(exercises[0].time);
      setIsExerciseComplete(false);
    }
  };

  const handleEdit = (index, field, value) => {
    const updatedExercises = exercises.map((exercise, i) =>
      i === index ? { ...exercise, [field]: value } : exercise
    );
    setExercises(updatedExercises);
    saveExercises(updatedExercises);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div>
      <h1>Exercise Tracker</h1>

      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      <div>
        <input
          type="text"
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          placeholder="Exercise name"
        />
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
        />
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Time (in seconds)"
        />
        <input
          type="number"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          placeholder="Sets"
        />
        <input
          type="number"
          value={breakTime}
          onChange={(e) => setBreakTime(e.target.value)}
          placeholder="Break Time (in seconds)"
        />
        <button onClick={addExercise}>Add Exercise</button>
      </div>

      <h2>Exercise List</h2>
      <ul>
        {exercises.map((exercise, index) => (
          <li key={index}>
            <input
              type="text"
              value={exercise.exerciseName}
              onChange={(e) => handleEdit(index, 'exerciseName', e.target.value)}
            />
            <input
              type="number"
              value={exercise.reps}
              onChange={(e) => handleEdit(index, 'reps', e.target.value)}
            />
            <input
              type="number"
              value={exercise.time}
              onChange={(e) => handleEdit(index, 'time', e.target.value)}
            />
            <input
              type="number"
              value={exercise.sets}
              onChange={(e) => handleEdit(index, 'sets', e.target.value)}
            />
            <input
              type="number"
              value={exercise.breakTime}
              onChange={(e) => handleEdit(index, 'breakTime', e.target.value)}
            />
            <button onClick={() => removeExercise(index)}>Remove</button>
          </li>
        ))}
      </ul>

      {exercises.length > 0 && (
        <div>
          <h3>Current Exercise: {exercises[currentExerciseIndex].exerciseName}</h3>
          <p>Set: {currentSet} / {exercises[currentExerciseIndex].sets}</p>
          <p>Rep: {currentRep} / {exercises[currentExerciseIndex].reps}</p>
          <p>Time remaining: {timeRemaining}s</p>

          {isOnBreak && <p>Break Time: {breakRemaining}s</p>}

          {!isTimerRunning ? (
            <button onClick={startTimer}>
              {isExerciseComplete ? 'Restart' : 'Start'}
            </button>
          ) : (
            <button onClick={() => setIsTimerRunning(false)}>Stop</button>
          )}

          {isExerciseComplete && (
            <button onClick={continueExercise}>
              {currentExerciseIndex === exercises.length - 1 ? 'Finish' : 'Continue'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
