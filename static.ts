import uuid from 'react-native-uuid';

const createUUID = uuid.v4;
interface ICategory {
  name: string;
  uuid: string;
}
interface IUnit {
  name: string;
  categories: Array<ICategory>;
}
interface IGrade {
  name: string;
  units: Array<IUnit>;
}
const createCategory = (name: string): ICategory => {
  return {name: name, uuid: createUUID() as string};
};

const defaultGrades = [
  {
    name: '수(하)',
    units: [
      {
        name: '집합과 명제',
        categories: [
          createCategory('집합, 원소'),
          createCategory('원소나열법, 조건제시법'),
          createCategory('부분집합, 진부분집합'),
          createCategory('집합의 연산'),
          createCategory('명제, 진리집합'),
          createCategory('충분조건, 필요조건, 필요충분조건'),
          createCategory('역, 대우, 귀류법'),
        ],
      },
      {
        name: '함수',
        categories: [
          createCategory('함수의 뜻'),
          createCategory('일대일함수, 일대일대응'),
          createCategory('항등함수, 상수함수'),
          createCategory('함성함수, 역함수'),
          createCategory('유리함수'),
          createCategory('무리함수'),
        ],
      },
      {
        name: '경우의 수',
        categories: [
          createCategory('합의 법칙, 곱의 법칙'),
          createCategory('n!'),
          createCategory('순열'),
          createCategory('조합'),
        ],
      },
    ],
  },
  {
    name: '수1',
    units: [
      {
        name: '지수함수와 로그함수',
        categories: [
          createCategory('지수'),
          createCategory('로그'),
          createCategory('지수함수'),
          createCategory('로그함수'),
        ],
      },
      {
        name: '삼각함수',
        categories: [
          createCategory('삼각함수'),
          createCategory('삼각함수의 그래프'),
          createCategory('삼각함수의 활용'),
        ],
      },
      {
        name: '수열',
        categories: [
          createCategory('등차수열과 등비수열'),
          createCategory('수열의 합'),
          createCategory('수학적 귀납법'),
        ],
      },
    ],
  },
];

export type {ICategory, IUnit, IGrade};
export {defaultGrades, createUUID};
