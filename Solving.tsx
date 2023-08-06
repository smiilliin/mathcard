import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useContext,
} from 'react';
import {
  Image,
  Linking,
  PermissionsAndroid,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import fs from 'react-native-fs';
import {Button, PanResponder} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import styled from 'styled-components/native';
import uuid from 'react-native-uuid';
import 'react-native-gesture-handler';
import {
  NavigationContainer,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ICategoryContent, IContext, SharedContext} from './App';
import {ICategory, IGrade} from './static';

const createUUID = uuid.v4;

const App = styled.SafeAreaView`
  width: 100vw;
  background-color: white;
`;

const Hider = styled.View`
  width: 100%;
  display: absolute;
  background-color: #7786b8;
`;
const QOpen = styled.Text`
  font-size: 40px;
`;

interface IEStar {
  content: ICategoryContent;
  categoryContents: ICategoryContent[];
  setCategoryContents: React.Dispatch<React.SetStateAction<ICategoryContent[]>>;
}
const Star = ({content, categoryContents, setCategoryContents}: IEStar) => {
  return (
    <TouchableOpacity
      onPress={() => {
        const newCategoryContents = [...categoryContents];

        const categoryContent = newCategoryContents.find(
          categoryContent => categoryContent == content,
        );
        if (categoryContent) {
          categoryContent.stared = !content.stared;
        }
        setCategoryContents(newCategoryContents);
      }}>
      <Image
        source={
          content.stared
            ? require('./images/enabledStar.png')
            : require('./images/star.png')
        }></Image>
    </TouchableOpacity>
  );
};
interface IEUnitText {
  currentContent: ICategoryContent | undefined;
  grades: Array<IGrade>;
}
const UnitText = ({currentContent, grades}: IEUnitText) => {
  const categoryID = currentContent?.categoryID;
  let unitName;

  grades.forEach(grade =>
    grade.units.forEach(unit =>
      unit.categories.forEach(categorie => {
        if (categorie.uuid == categoryID) {
          unitName = unit.name;
        }
      }),
    ),
  );
  return <Text>{unitName}</Text>;
};

export default () => {
  const {
    grades,
    selectedCategoryContents,
    setSelectedCategoryContents,
    categories,
    categoryContents,
    setCategoryContents,
  } = useContext(SharedContext) as IContext;
  const navigation = useNavigation();

  const [imageURI, setImageURI] = useState<string | undefined>();
  const [hiderTop, setHiderTop] = useState<number>(0);
  const [hiderShown, setHiderShown] = useState<boolean>(false);
  const [hiderHeight, setHiderHeight] = useState<number>(200);
  const [randomContents, setRandomContents] = useState<Array<ICategoryContent>>(
    new Array(),
  );
  const [currentContent, setCurrentContent] = useState<
    ICategoryContent | undefined
  >();
  const [currentContentIndex, setCurrentContentIndex] = useState<number>(-1);
  const [maxContents, setMaxContent] = useState<number>(0);
  const getURIFromID = useCallback((uuid: string) => {
    return `file://${fs.DocumentDirectoryPath}/${uuid}`;
  }, []);

  const panResponder: any = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (e, gestureState) => {
          if (!hiderShown) {
            if (gestureState.dy > 0) setHiderTop(gestureState.dy);
          } else {
            if (gestureState.dy + hiderTop >= 0)
              setHiderTop(gestureState.dy + hiderTop);
          }
        },
        onPanResponderEnd(e, gestureState) {
          if (gestureState.dy > hiderHeight - 40) {
            setHiderTop(hiderHeight - 40);
            setHiderShown(true);
          } else {
            setHiderTop(0);
            setHiderShown(false);
          }
        },
      }),
    [hiderShown, hiderHeight],
  );

  useEffect(() => {
    const randomContents = [...selectedCategoryContents];
    randomContents.sort(() => Math.random() - 0.5);
    const maxContents = Math.min(20, selectedCategoryContents.length);
    setRandomContents(randomContents.slice(0, maxContents));
    setMaxContent(maxContents);
  }, [selectedCategoryContents]);
  useEffect(() => {
    if (currentContentIndex != -1) {
      setCurrentContent(randomContents[currentContentIndex]);
    }
  }, [currentContentIndex, randomContents]);
  useEffect(() => {}, [currentContent]);
  useEffect(() => {
    setCurrentContentIndex(0);
  }, []);

  return (
    <App style={{flex: 1}}>
      <StatusBar barStyle={'light-content'} />
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          width: 40,
          height: 40,
          zIndex: 3,
        }}
        onPress={() => {
          if (currentContentIndex == -1) return;
          if (hiderShown) {
            if (currentContentIndex == randomContents.length - 1) {
              setCurrentContentIndex(0);
            }
            randomContents.splice(currentContentIndex, 1);
            setRandomContents([...randomContents]);
            setHiderTop(0);
            setHiderShown(false);

            if (randomContents.length == 0) {
              navigation.navigate('문제 고르기' as never);
              setSelectedCategoryContents([]);
            }
          } else {
            let newCurrentContentIndex =
              currentContentIndex == randomContents.length - 1
                ? 0
                : currentContentIndex + 1;
            setCurrentContentIndex(newCurrentContentIndex);
          }
        }}>
        <Image
          style={{
            width: 40,
            height: 40,
          }}
          source={require('./images/next.png')}></Image>
      </TouchableOpacity>

      <View style={{flex: 1, flexDirection: 'row'}}>
        <View style={{flex: 2, flexDirection: 'column'}}>
          <View style={{flex: 1, backgroundColor: '#DBE3F7'}}>
            <UnitText
              currentContent={currentContent}
              grades={grades}></UnitText>
          </View>
          <ScrollView style={{flex: 4, backgroundColor: '#DBE3F7'}}>
            <Text style={{fontSize: 20}}>
              {[
                !hiderShown ? randomContents.length : randomContents.length - 1,
                maxContents,
              ].join('/')}
            </Text>
          </ScrollView>
        </View>
        <View style={{flex: 5, flexDirection: 'column'}}>
          {currentContent ? (
            <>
              <View
                style={{
                  height: 40,
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                }}>
                <Star
                  content={currentContent}
                  categoryContents={categoryContents}
                  setCategoryContents={setCategoryContents}></Star>
                <Text style={{fontSize: 20}}>
                  {
                    categories.find(
                      category => category.uuid == currentContent?.categoryID,
                    )?.name
                  }
                </Text>
              </View>
              <Image
                source={{uri: getURIFromID(currentContent.problemID)}}
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                }}
                resizeMode="contain"></Image>
            </>
          ) : (
            <View style={{flex: 1}}></View>
          )}
          <View style={{flex: 1}}>
            <Hider
              onLayout={event => {
                const newHiderHeight = event.nativeEvent.layout.height;

                if (Math.abs(newHiderHeight - hiderHeight) < 1) return;
                setHiderHeight(newHiderHeight);
              }}
              style={{
                flex: 1,
                top: hiderTop,
                height: hiderHeight,
                zIndex: 2,
                alignItems: 'center',
                paddingTop: 10,
              }}
              {...panResponder.panHandlers}>
              <Image
                source={require('./images/double-down-arrows.png')}
                style={{width: 30, height: 30}}
                resizeMode="contain"></Image>
            </Hider>
            {currentContent ? (
              <Image
                source={{uri: getURIFromID(currentContent.solveID)}}
                style={{
                  flex: 1,
                  width: '100%',
                  height: hiderHeight - 40,
                  position: 'absolute',
                  zIndex: 1,
                }}
                resizeMode="contain"></Image>
            ) : (
              <View style={{flex: 1, position: 'absolute'}}></View>
            )}
          </View>
        </View>
      </View>
    </App>
  );
};
