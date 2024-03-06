import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Platform,
} from 'react-native';
import {light, dark} from '../../../assets/colors/colors';
import useStore from '../../../data/store';
import {trigger} from 'react-native-haptic-feedback';

const CODE_LENGTH = 6;

const Pin = props => {
  const {pin, theme} = useStore();
  const codeDigitsArray = new Array(CODE_LENGTH).fill(0);
  const {hepticOptions} = useStore();

  const [containerIsFocused, setContainerIsFocused] = React.useState(true);
  const ref = React.useRef(null);

  let colors = light;
  if (theme === 'dark') {
    colors = dark;
  }

  const styles = styling(colors);

  React.useEffect(() => {
    setTimeout(() => ref?.current.focus(), 100);
  });

  React.useEffect(() => {
    setTimeout(() => ref?.current.focus(), 100);
  }, []);

  const handleOnPress = () => {
    setContainerIsFocused(true);
    setTimeout(() => ref?.current.focus(), 100);
  };

  const handleOnBlur = () => {
    setContainerIsFocused(false);
  };

  const changeCode = input => {
    props.setPin(input);
    if (input.length === CODE_LENGTH) {
      if (props.role !== 'set') {
        // verify pin
        if (input === pin) {
          setTimeout(() => {
            trigger('impactHeavy', hepticOptions);
            setContainerIsFocused(true);
            // ref?.current?.focus();
            props.onSuccess();
          }, 200);
        } else {
          props.onFailure();
          trigger('impactHeavy', hepticOptions);
        }
        // very slight delay so code shows up THEN screen changes
      } else {
        // set pin
        props.setPin(input);
      }
    }
  };

  const toDigitInput = (_value, idx) => {
    const emptyInputChar = ' ';
    const digit = props.pin[idx] || emptyInputChar;

    const isCurrentDigit = idx === props.pin.length;
    const isLastDigit = idx === CODE_LENGTH - 1;
    const isCodeFull = props.pin.length === CODE_LENGTH;

    const isFocused = isCurrentDigit || (isLastDigit && isCodeFull);

    const containerStyle =
      containerIsFocused && isFocused
        ? {...styles.inputContainer, ...styles.inputContainerFocused}
        : styles.inputContainer;

    return (
      <View key={idx} style={containerStyle} onPress={handleOnPress}>
        <View key={idx} style={containerStyle} onPress={handleOnPress}>
          {idx < props.pin.length && (
            <Text style={styles.inputTextCircle}>●</Text>
          )}
          {idx >= props.pin.length && <Text style={styles.inputText}></Text>}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} onPress={handleOnPress}>
      <TouchableOpacity style={styles.inputsContainer} onPress={handleOnPress}>
        {codeDigitsArray.map(toDigitInput)}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.inputsContainerTransparent}
        onPress={handleOnPress}
        onFocus={() => ref?.current?.focus()}>
        <Text style={styles.inputsContainerTransparentText}>Focus</Text>
      </TouchableOpacity>
      <TextInput
        autoFocus={true}
        ref={ref}
        value={props.pin}
        onChangeText={input => changeCode(input)}
        keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'decimal-pad'}
        maxLength={CODE_LENGTH}
        style={styles.hiddenCodeInput}
        onSubmitEditing={handleOnBlur}
        // secureTextEntry
        onFocus={() => ref?.current?.focus()}
      />
    </SafeAreaView>
  );
};

const styling = colors =>
  StyleSheet.create({
    container: {
      // flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hiddenCodeInput: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      opacity: 0,
    },
    inputsContainer: {
      width: '60%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputsContainerTransparent: {
      marginTop: -50,
      width: 300,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
    },
    inputsContainerTransparentText: {
      color: 'transparent',
    },
    inputContainer: {
      borderColor: colors.text_light,
      borderWidth: 2,
      borderRadius: 4,
      padding: 5,
      margin: 2,
      width: 36,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputContainerFocused: {
      borderColor: colors.primary,
    },
    inputText: {
      fontSize: 24,
      color: colors.primary,
      fontFamily: 'NexaBold',
      fontWeight: 'bold',
      marginTop: 6,
    },
    inputTextCircle: {
      fontSize: 24,
      color: colors.primary,
      fontFamily: 'NexaBold',
      fontWeight: 'bold',
    },
  });

export default Pin;
