import React, {useContext, useEffect} from 'react';
import {Image, ScrollView, StatusBar, Text} from 'react-native';
import styled from 'styled-components/native';
import 'react-native-gesture-handler';
import {ICategoryContent, IContext, SharedContext} from './App';

const App = styled.SafeAreaView`
  width: 100vw;
  background-color: white;
`;

interface IECategoryText {
  uuid?: string;
  name: string;
  categoryContents: ICategoryContent[];
  selectedProblems: Array<ICategoryContent>;
  setSelectedProblems: React.Dispatch<
    React.SetStateAction<Array<ICategoryContent>>
  >;
  stared?: boolean;
}
const CategoryText = ({
  uuid: categoryID,
  name,
  selectedProblems,
  setSelectedProblems,
  categoryContents,
  stared,
}: IECategoryText) => {
  const isSelected =
    selectedProblems.findIndex(
      selectedProblem => selectedProblem.categoryID == categoryID,
    ) != -1;

  return (
    <Text
      style={{fontSize: 20, color: isSelected ? '#B8B8B8' : 'black'}}
      onPress={() => {
        if (!isSelected) {
          let newSelectedProblems;
          if (!stared) {
            newSelectedProblems = [
              ...selectedProblems,
              ...categoryContents
                .filter(
                  categoryContent => categoryContent.categoryID == categoryID,
                )
                .filter(
                  categoryContent =>
                    selectedProblems.findIndex(
                      selectedProblem =>
                        selectedProblem.problemID == categoryContent.problemID,
                    ) == -1,
                ),
            ];
          } else {
            newSelectedProblems = [
              ...selectedProblems,
              ...categoryContents
                .filter(categoryContent => categoryContent.stared)
                .filter(
                  categoryContent =>
                    selectedProblems.findIndex(
                      selectedProblem =>
                        selectedProblem.problemID == categoryContent.problemID,
                    ) == -1,
                ),
            ];
          }
          setSelectedProblems(newSelectedProblems);
        } else {
          if (!stared) {
            let currentSelectedProblems = [...selectedProblems];

            categoryContents
              .filter(
                categoryContent => categoryContent.categoryID == categoryID,
              )
              .forEach(categoryContent => {
                let uuidIndex =
                  currentSelectedProblems.indexOf(categoryContent);
                currentSelectedProblems.splice(uuidIndex, 1);
              });
            setSelectedProblems(currentSelectedProblems);
          } else {
            let currentSelectedProblems = [...selectedProblems];

            categoryContents
              .filter(categoryContent => categoryContent.stared)
              .forEach(categoryContent => {
                let uuidIndex =
                  currentSelectedProblems.indexOf(categoryContent);
                currentSelectedProblems.splice(uuidIndex, 1);
              });
            setSelectedProblems(currentSelectedProblems);
          }
        }
      }}>
      {'\t' + name}
    </Text>
  );
};

export default () => {
  const {
    grades,
    selectedCategoryContents,
    setSelectedCategoryContents,
    categoryContents,
  } = useContext(SharedContext) as IContext;

  return (
    <App style={{flex: 1}}>
      <StatusBar barStyle={'light-content'} />

      <ScrollView style={{flex: 1}}>
        <CategoryText
          name={'중요한 문제'}
          categoryContents={categoryContents}
          selectedProblems={selectedCategoryContents}
          setSelectedProblems={setSelectedCategoryContents}
          stared={true}></CategoryText>
        {grades.map(grade => (
          <React.Fragment key={grade.name}>
            <Text style={{fontSize: 35}}>{grade.name}</Text>
            {grade.units.map(unit => (
              <React.Fragment key={unit.name}>
                <Text style={{fontSize: 25}} key={unit.name}>
                  <Image
                    style={{height: 30}}
                    resizeMode="contain"
                    source={require('./images/dir.png')}
                  />
                  {unit.name}
                </Text>
                {unit.categories.map(({uuid, name}) => (
                  <CategoryText
                    uuid={uuid}
                    name={name}
                    selectedProblems={selectedCategoryContents}
                    setSelectedProblems={setSelectedCategoryContents}
                    categoryContents={categoryContents}
                    key={uuid}></CategoryText>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </ScrollView>
    </App>
  );
};
