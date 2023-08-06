import React, {createContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Solving from './Solving';
import Upload from './Upload';
import Select from './Select';
import {ICategory, IGrade, IUnit, defaultGrades} from './static';
import fs from 'react-native-fs';

const Tab = createBottomTabNavigator();
interface IContext {
  grades: IGrade[];
  categoryContents: ICategoryContent[];
  setCategoryContents: React.Dispatch<React.SetStateAction<ICategoryContent[]>>;
  selectedCategoryContents: Array<ICategoryContent>;
  setSelectedCategoryContents: React.Dispatch<
    React.SetStateAction<Array<ICategoryContent>>
  >;
  categories: Array<ICategory>;
}
interface ICategoryContent {
  problemID: string;
  solveID: string;
  categoryID: string;
  stared: boolean;
}

export const SharedContext = createContext<IContext | undefined>(undefined);
export type {IContext};

export const loadSetting = async (fileName: string) => {
  const filePath = `${fs.DocumentDirectoryPath}/${fileName}`;
  if (!(await fs.exists(filePath))) {
    return [];
  }
  try {
    const fileData = await fs.readFile(filePath);
    return JSON.parse(fileData);
  } catch {
    return [];
  }
};
export const saveSetting = async (fileName: string, content: any) => {
  const filePath = `${fs.DocumentDirectoryPath}/${fileName}`;
  return fs.writeFile(filePath, JSON.stringify(content));
};

const App = () => {
  const [grades, setGrades] = useState<Array<IGrade>>(new Array());
  const [categoryContents, setCategoryContents] = useState<
    Array<ICategoryContent>
  >(new Array());
  const [selectedCategoryContents, setSelectedCategoryContents] = useState<
    Array<ICategoryContent>
  >(new Array());
  const [categories, setCategories] = useState<Array<ICategory>>(new Array());

  //Load categories
  useEffect(() => {
    (async () => {
      let grades: Array<IGrade> = await loadSetting('grades.json');
      if (Object.keys(grades).length == 0) {
        grades = defaultGrades;
        await saveSetting('grades.json', grades);
      }

      setGrades(grades);
      let categoryContents: Array<ICategoryContent> = await loadSetting(
        'categoryContents.json',
      );
      if (Object.keys(categoryContents).length == 0) {
        categoryContents = [];
        await saveSetting('categoryContents.json', categoryContents);
      }
      setCategoryContents(categoryContents);

      const categories: Array<ICategory> = [];
      grades.forEach(grade =>
        grade.units.forEach(unit => categories.push(...unit.categories)),
      );
      setCategories(categories);
    })();
  }, []);
  useEffect(() => {
    if (categoryContents.length == 0) return;
    saveSetting('categoryContents.json', categoryContents);
  }, [categoryContents]);

  return (
    <NavigationContainer>
      <SharedContext.Provider
        value={{
          grades,
          categoryContents,
          setCategoryContents,
          selectedCategoryContents: selectedCategoryContents,
          setSelectedCategoryContents: setSelectedCategoryContents,
          categories: categories,
        }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarIconStyle: {display: 'none'},
          }}>
          <Tab.Screen name="문제 고르기" component={Select} />
          {selectedCategoryContents.length != 0 ? (
            <Tab.Screen name="문제 풀기" component={Solving} />
          ) : (
            <></>
          )}
          <Tab.Screen name="문제 업로드 하기" component={Upload} />
        </Tab.Navigator>
      </SharedContext.Provider>
    </NavigationContainer>
  );
};

export default App;
export type {ICategoryContent};
