import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function Timer({ timeLeft, totalTime }) {
    // Calculate percentage for the ring stroke
    const percentage = (timeLeft / totalTime) * 100;

    return (
        <div className='w-20 h-20'>
            <CircularProgressbar
                value={percentage}
                // Displaying actual seconds left is more helpful for the user
                text={`${timeLeft}s`}
                styles={buildStyles({
                    textSize: "28px",
                    pathColor: timeLeft < 10 ? "#ef4444" : "#10b981", // Turns red when low
                    textColor: timeLeft < 10 ? "#ef4444" : "#374151",
                    trailColor: "#e5e7eb",
                    pathTransitionDuration: 0.5,
                })}
            />
        </div>
    );
}export default Timer;