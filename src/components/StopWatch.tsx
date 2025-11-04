import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Circle, Svg } from 'react-native-svg';


function StopWatch() {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalIdRef = useRef(null);
    const startTimeRef = useRef(0);

    useEffect(() => {

        if(isRunning){
            intervalIdRef.current = setInterval(() => {
                setElapsedTime(Date.now() -  startTimeRef.current);
            }, 10);
        }
    })

    return (

        <View className="flex-1 items-center justify-center w-3/4 max-w-[300px] aspect-square">
            <View className="items-center justify-center mt-12 ">
                        <Text className="text-5xl text-light-100 font-bold absolute">00:00:00</Text>
                        <Svg width="100%" height="100%" viewBox="0 0 100 100">
                            <Circle cx="50" cy="50" r="45" stroke="tomato" strokeWidth="4" fill="none" />
                        </Svg>
            </View>
            <View className="flex-row mt-4">
                <Pressable className="flex-1 m-2 items-center justify-center border border-light-100 rounded-[25px] px-6 py-3"><Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Start</Text></Pressable>
                <Pressable className="flex-1 m-2 items-center justify-center border border-light-100 rounded-[25px] px-6 py-3"><Text selectable={false} className="text-2xl text-light-100 font-bold select-none">Stop</Text></Pressable>
            </View>
        </View>
    )
}

export default StopWatch;