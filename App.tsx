import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const T = true;
  const F = false;

  const arrP = [T, T, T, T, F, F, F, F];
  const arrQ = [T, T, F, F, T, T, F, F];
  const arrR = [T, F, T, F, T, F, T, F];

  const whenGetTwoVariableP = [T, T, F, F];
  const whenGetTwoVariableQ = [T, F, T, F];

  function andCalc(arr1: boolean[], arr2: boolean[]): boolean[] {
    return arr1.map((value, index) => value && arr2[index]);
  }

  function orCalc(arr1: boolean[], arr2: boolean[]): boolean[] {
    return arr1.map((value, index) => value || arr2[index]);
  }

  function arrowCalc(arr1: boolean[], arr2: boolean[]): boolean[] {
    return arr1.map((value, index) =>
      value === true && arr2[index] === false ? false : true
    );
  }

  const [text, setText] = useState('');
  const [currentResult, setCurrentResult] = useState<boolean[]>([]); // 결과 상태 변수

  // 엔터를 눌렀을 때 논리식을 처리하는 함수
  const handleLogicCalculation = () => {
    const containInputAsArray = text.split(' '); // 공백을 기준으로 텍스트 분리

    // 1. 짝수 인덱스에서 "~" 제거하고 중복 제거
    const variables = containInputAsArray
      .filter((_, index) => index % 2 === 0) // 짝수 인덱스만 선택
      .map((variable) => variable.replace('~', '')); // "~" 제거

    const uniqueVariables = Array.from(new Set(variables)); // 중복 제거

    // 2. 배열 매핑 (arrP, arrQ, arrR에 순차적으로 할당)
    let arrays: boolean[][] = [arrP, arrQ, arrR];

    // 만약 변수가 두 개라면, whenGetTwoVariableP, whenGetTwoVariableQ 사용
    if (uniqueVariables.length === 2) {
      arrays = [whenGetTwoVariableP, whenGetTwoVariableQ];
    }

    // 3. uniqueVariables를 arrP, arrQ, arrR에 매핑
    const assignedVars = uniqueVariables.map((variable, i) => {
      let assignedArray = arrays[i];

      // "~"가 붙은 변수가 있으면 해당 배열을 뒤집음
      if (containInputAsArray[i * 2].includes('~')) {
        assignedArray = assignedArray.map((value) => !value); // true/false 뒤집기
      }

      return assignedArray;
    });

    // 4. 변수를 원래 논리식의 배열에 할당
    const resultArray = containInputAsArray.map((item, index) => {
      if (index % 2 === 0) {
        const varIndex = variables.indexOf(item.replace('~', ''));
        return assignedVars[varIndex]; // 해당 변수에 매핑된 배열 할당
      }
      return item; // 논리 연산자 그대로 유지
    });


    let currentResult: boolean[] = resultArray[0] as boolean[]; // 첫 번째 변수 (배열)
    let arrowOperands: [boolean[], boolean[]][] = []; // -> 연산을 위한 좌변, 우변 저장

    for (let i = 1; i < resultArray.length; i += 2) {
      const operator = resultArray[i] as string; // 연산자
      const nextArray = resultArray[i + 1] as boolean[]; // 다음 배열

      // 연산자에 따른 연산 처리
      if (operator === '^') {
        currentResult = andCalc(currentResult, nextArray);
      } else if (operator === 'v') {
        currentResult = orCalc(currentResult, nextArray);
      } else if (operator === '->') {
        // -> 연산은 나중에 처리하기 위해 저장
        arrowOperands.push([currentResult, nextArray]);
        currentResult = nextArray; // 우변을 currentResult로 임시 저장
      }
      console.log(currentResult);
    }

    // 화살표(->) 연산을 마지막에 처리
    for (const [leftOperand, rightOperand] of arrowOperands) {
      currentResult = arrowCalc(leftOperand, rightOperand);
      console.log("After -> operator: ", currentResult);
    }

    setCurrentResult(currentResult); // 계산 결과를 상태로 설정
  };

  // boolean 값을 T/F 문자열로 변환
  const formatResult = (resultArray: boolean[]) => {
    return resultArray.map((value) => (value ? 'T' : 'F')).join(', ');
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Text>진리값 계산기</Text>
        <Text style={{ padding: 10, textAlign: 'center' }}>
          괄호를 사용하면 안되고, 명제 변수의 개수는 3개, 논리연산자는 4개까지만 입력한다.
        </Text>
        <Text>반드시 띄어쓰기 단위로 입력을 해야한다.</Text>
      </View>

      <View>
        <TextInput
          style={{
            borderRadius: 20,
            height: 40,
            borderColor: 'gray',
            borderWidth: 1,
            paddingHorizontal: 10,
            marginBottom: 20,
            width: 300,
          }}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleLogicCalculation} // 엔터 눌렀을 때 실행
          placeholder="여기에 논리식을 입력하세요"
          autoCapitalize="none"
        />
      </View>

      {/* 진리값 결과 표시 */}
      {currentResult.length > 0 && (
        <View>
          <Text>진리표 결과: [{formatResult(currentResult)}]</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});