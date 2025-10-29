import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export default function CircularProgress({
    percentage= 75,
    radius = 40,
    strokeWidth = 10,
    duration = 500,
    color = 'tomato',
    delay = 0,
    max = 100,
}) {
    return (
        <View>
            <Svg width={radius * 2} height={radius * 2} />
            <G>
                <Circle/>
                <Circle/>
            </G>
        </View>
    )
}