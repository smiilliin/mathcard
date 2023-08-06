import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  Image,
  Linking,
  PermissionsAndroid,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import fs from 'react-native-fs';
import {Button} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import styled from 'styled-components/native';
import {createUUID} from './static';
import {ICategoryContent, IContext, SharedContext} from './App';

const App = styled.SafeAreaView`
  width: 100vw;
  background-color: white;
`;

enum UploadTypeEnum {
  Problems,
  Solves,
}

export default () => {
  const [problemImageURIs, setProblemURIs] = useState<
    Array<string> | undefined
  >();
  const [solveImageURIs, setSolveImageURIs] = useState<
    Array<string> | undefined
  >();
  const [UploadType, setUploadType] = useState<UploadTypeEnum>(
    UploadTypeEnum.Problems,
  );

  const getURIFromFilePath = useCallback((filePath: string) => {
    return `file://${filePath}`;
  }, []);

  useEffect(() => {}, []);

  //Permissions
  useEffect(() => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ])
      .then(granted => {
        if (
          granted['android.permission.READ_MEDIA_IMAGES'] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.CAMERA'] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          Toast.show({
            text1: '오류',
            text2: '권한을 허용해주세요!',
            onPress: () => {
              Linking.openSettings();
            },
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const {grades, categoryContents, setCategoryContents} = useContext(
    SharedContext,
  ) as IContext;

  return (
    <App style={{flex: 1}}>
      <StatusBar barStyle={'light-content'} />

      <View style={{flex: 1, flexDirection: 'column'}}>
        {problemImageURIs ? (
          problemImageURIs.map(imageURI => (
            <Image
              source={{
                uri: imageURI,
              }}
              key={imageURI}
              style={{flex: 1, width: '100%', height: '100%'}}
              resizeMode="contain"></Image>
          ))
        ) : (
          <></>
        )}
        {solveImageURIs ? (
          solveImageURIs.map(imageURI => (
            <Image
              source={{
                uri: imageURI,
              }}
              key={imageURI}
              style={{flex: 1, width: '100%', height: '100%'}}
              resizeMode="contain"></Image>
          ))
        ) : (
          <></>
        )}
        <View style={{height: 80}}>
          <Button
            title={
              UploadType == UploadTypeEnum.Problems
                ? '갤러리에서 문제 불러오기'
                : '갤러리에서 답 불러오기'
            }
            onPress={() => {
              launchImageLibrary({mediaType: 'photo'}, res => {
                const imageURIs = res.assets
                  ?.map<string | undefined>(({uri}) => {
                    if (!uri) return;
                    const imagePath = `${
                      fs.DocumentDirectoryPath
                    }/${createUUID()}`;

                    fs.copyFile(uri, imagePath);
                    return getURIFromFilePath(imagePath);
                  })
                  .filter(v => v !== undefined) as Array<string>;

                if (UploadType == UploadTypeEnum.Problems) {
                  if (!imageURIs) return;
                  setProblemURIs(imageURIs);
                  setUploadType(UploadTypeEnum.Solves);
                } else if (UploadType == UploadTypeEnum.Solves) {
                  if (!imageURIs) return;
                  setSolveImageURIs(imageURIs);
                  setUploadType(UploadTypeEnum.Problems);
                }
              });
            }}></Button>
          <Button
            title={
              UploadType == UploadTypeEnum.Problems
                ? '카메라로 문제 불러오기'
                : '카메라로 답 불러오기'
            }
            onPress={() => {
              launchCamera({mediaType: 'photo'}, res => {
                const imageURIs = res.assets
                  ?.map<string | undefined>(({uri}) => {
                    if (!uri) return;
                    const imagePath = `${
                      fs.DocumentDirectoryPath
                    }/${createUUID()}`;
                    fs.moveFile(uri, imagePath);
                    return getURIFromFilePath(imagePath);
                  })
                  .filter(v => v !== undefined) as Array<string>;

                if (UploadType == UploadTypeEnum.Problems) {
                  if (!imageURIs) return;
                  setProblemURIs(imageURIs);
                  setUploadType(UploadTypeEnum.Solves);
                } else if (UploadType == UploadTypeEnum.Solves) {
                  if (!imageURIs) return;
                  setSolveImageURIs(imageURIs);
                  setUploadType(UploadTypeEnum.Problems);
                }
              });
            }}></Button>
        </View>
      </View>
      <ScrollView style={{flex: 1}}>
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
                {unit.categories.map(category => (
                  <Text
                    style={{fontSize: 20}}
                    onPress={() => {
                      if (!problemImageURIs) return;
                      if (!solveImageURIs) return;

                      const newCategoryContents = [...categoryContents];
                      const toPush = (
                        problemImageURIs.length > solveImageURIs.length
                          ? problemImageURIs
                          : solveImageURIs
                      ).map<ICategoryContent>((imageURI, index) => {
                        if (problemImageURIs.length > solveImageURIs.length) {
                          return {
                            categoryID: category.uuid,
                            problemID: imageURI.split('/').at(-1) as string,
                            solveID: solveImageURIs[index]
                              .split('/')
                              .at(-1) as string,
                            stared: false,
                          };
                        } else {
                          return {
                            categoryID: category.uuid,
                            problemID: problemImageURIs[index]
                              .split('/')
                              .at(-1) as string,
                            solveID: imageURI.split('/').at(-1) as string,
                            stared: false,
                          };
                        }
                      });
                      newCategoryContents.push(...toPush);

                      setCategoryContents(newCategoryContents);
                      setProblemURIs(undefined);
                      setSolveImageURIs(undefined);
                    }}
                    key={category.uuid}>
                    {'\t' + category.name}
                  </Text>
                ))}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </ScrollView>
    </App>
  );
};
