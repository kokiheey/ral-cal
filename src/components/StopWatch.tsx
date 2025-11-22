import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Circle, Svg } from 'react-native-svg';
import { loadStartTime, loadStopWatchRunning, saveStartTime, saveStopWatchRunning } from "../services/storage";

interface StopWatchProps{
    onStart: () => void;
    onStop: () => void;
}

function StopWatch({onStart, onStop}:StopWatchProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalIdRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);

    async function handleStart(){
        startTimeRef.current = Date.now();
        //console.log(startTimeRef.current);
        setIsRunning(true);
        await saveStopWatchRunning(true);
        await saveStartTime(startTimeRef.current);
        onStart();
    }

    function handleStop(){
        setIsRunning(false);
        saveStopWatchRunning(false);
        onStop();

        setElapsedTime(0);
    }

    useEffect(() => {
        if(isRunning){
            intervalIdRef.current = setInterval(() => {
                setElapsedTime(Date.now() - startTimeRef.current);
            }, 10);
        }
        return () => { 
            clearInterval(intervalIdRef.current);
        }
    }, [isRunning]);

    useEffect(() =>{
        const loadInitialState = async () => {
            
            try {
                const stored = await loadStartTime();
                if (stored !== null) {
                    const stopwatchState = await loadStopWatchRunning();
                    setIsRunning(stopwatchState || false);

                    if(stopwatchState){
                        startTimeRef.current = stored;
                        setElapsedTime(Date.now() - stored);
                    } else {
                        setElapsedTime(0);
                    }
                }
            } catch (error) {
                console.error('Error loading stopwatch state:', error);
            }
        };
        loadInitialState();
    },[])

    function formatTime(){
        let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        let minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
        let seconds = Math.floor(elapsedTime / (1000) % 60);

        let Shours = String(hours).padStart(2, "0");
        let Sminutes = String(minutes).padStart(2,"0");
        let Sseconds = String(seconds).padStart(2,"0");
        return `${Shours}:${Sminutes}:${Sseconds}`;
    }

    return (

        <View className="items-center justify-center w-3/4 max-w-[300px] aspect-square h-[300px]">
            <View className="w-full h-full items-center justify-center mt-12 ">
                        <Text className="text-5xl text-light-100 font-bold absolute">{formatTime()}</Text>
                        <Svg width="100%" height="100%" viewBox="0 0 100 100">
                            <Circle cx="50" cy="50" r="45" stroke="tomato" strokeWidth="4" fill="none" />
                        </Svg>
            </View>
            <View className="flex-row mt-4">
                <Pressable className="flex-1 m-2 items-center justify-center border border-light-100 rounded-[25px] px-6 py-3" onPress={handleStart}
                >
                     {({ pressed }) => (
                        <View
                        className={
                            pressed
                            ? "opacity-60 scale-95"
                            : "opacity-100 scale-100"
                        }
                        >
                        <Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Start</Text>

                        </View>
                     )}
                    </Pressable>
                <Pressable className="flex-1 m-2 items-center justify-center border border-light-100 rounded-[25px] px-6 py-3" onPress={handleStop}><Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Stop</Text></Pressable>
            </View>
        </View>
    )
}

export default StopWatch;