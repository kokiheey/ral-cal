import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
function StopWatch(){

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalIdRef = useRef(null);
  const startTimeRef = useRef(0);
  const { height, width } = useWindowDimensions();


  const styles = StyleSheet.create({
    stopwatch: {
      flex: 1,
      alignItems: 'center',
      paddingTop: height*0.1
    },
    controls: {
    }
  })

  
  useEffect(() => {

  }, [isRunning]);

  function start(){

  }

  function stop(){

  }

  function reset(){

  }

  function formatTime(){
    return '00:00:00'
  }
  return(
    <View style={styles.stopwatch}>
        <View>
          <Text>{formatTime()}</Text>
        </View>
        <View style={styles.controls}>
          <Pressable onPress={start}>
            <Text>Start</Text>
          </Pressable>  
          <Pressable onPress={stop}>
            <Text>Stop</Text>
          </Pressable>  
        </View> 
    </View>
  );

  
}



export default StopWatch