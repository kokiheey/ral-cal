import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Circle, Svg } from 'react-native-svg';
import { loadStartTime, loadStopWatchRunning, saveStartTime, saveStopWatchRunning } from "../services/storage";

interface StopWatchProps{
    onStart: () => void;
    onStop: () => void;
}

function StopWatch({onStart, onStop}: StopWatchProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [inSession, setInSession] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const uiStartRef = useRef(0); //za stopwatch
    const segmentStartRef = useRef(0); //za "backend"
    const intervalIdRef = useRef<NodeJS.Timer | null>(null);

    function handleStart(){
        uiStartRef.current = Date.now();
        segmentStartRef.current = Date.now();
        saveStartTime(uiStartRef.current);
        setElapsedTime(0);
        setIsRunning(true);
        setInSession(true);
        onStart();
    }

    function handlePause(){
        setIsPaused(true);
        setIsRunning(false);
        onStop();
    }

    function handleUnpause(){
        setIsPaused(false);
        setIsRunning(true);
        uiStartRef.current = Date.now() - elapsedTime;
        segmentStartRef.current = Date.now();
        saveStartTime(uiStartRef.current);
        onStart();
    }

    function handleStop(){
        setIsRunning(false);
        setInSession(false);
        saveStopWatchRunning(false);
        onStop();
        setElapsedTime(0);
    }

    useEffect(() => {
        if(isRunning){
            intervalIdRef.current = setInterval(() => {
                setElapsedTime(Date.now() - uiStartRef.current);
            }, 10);
        }
        return () => {
            if(intervalIdRef.current) clearInterval(intervalIdRef.current);
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
                        uiStartRef.current = stored;
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
    },[]);

    function formatTime(){
        const hours = Math.floor(elapsedTime / (1000 * 60 * 60));
        const minutes = Math.floor(elapsedTime / (1000 * 60) % 60);
        const seconds = Math.floor(elapsedTime / 1000 % 60);

        const Shours = String(hours).padStart(2, "0");
        const Sminutes = String(minutes).padStart(2,"0");
        const Sseconds = String(seconds).padStart(2,"0");
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
                {inSession? (
                    isPaused?(
                        <Pressable
                        className="flex-1 m-2 items-center justify-center active:bg-dark-200 bg-dark-100 border border-light-100 rounded-[25px] px-6 py-3"
                        onPress={handleUnpause}>
                            {({ pressed }) => (
                                <View
                                className={
                                    pressed
                                    ? "opacity-60 scale-95"
                                    : "opacity-100 scale-100"
                                }
                                >
                                <Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Unpause</Text>

                                </View>
                            )}
                        </Pressable>
                    ):(
                        <Pressable
                        className="flex-1 m-2 items-center justify-center active:bg-dark-200 bg-dark-100 border border-light-100 rounded-[25px] px-6 py-3"
                        onPress={handlePause}>
                            {({ pressed }) => (
                                <View
                                className={
                                    pressed
                                    ? "opacity-60 scale-95"
                                    : "opacity-100 scale-100"
                                }
                                >
                                <Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Pause</Text>

                                </View>
                            )}
                        </Pressable>
                    )
                ):(
                    <Pressable
                    className="flex-1 m-2 items-center justify-center active:bg-dark-200 bg-dark-100 border border-light-100 rounded-[25px] px-6 py-3"
                    onPress={handleStart}>
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
                )}
                <Pressable className="flex-1 m-2 items-center justify-center active:bg-dark-200 bg-dark-100 border border-light-100 rounded-[25px] px-6 py-3" onPress={handleStop}>
                    {({ pressed }) => (
                        <View
                        className={
                            pressed
                            ? "opacity-60 scale-95"
                            : "opacity-100 scale-100"
                        }
                        >
                        <Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Stop</Text>
                    </View>
                     )}
                </Pressable>
            </View>
        </View>
    )
}

export default StopWatch;