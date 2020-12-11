export type DeepPartial<T> = {
  [P in keyof T]?: Partial<T[P]>;
};

export type Join<T extends readonly any[]> = T extends readonly [infer P, ...infer R]
  ? P extends string
    ? [] extends R
      ? P
      : `${P} $_ ${Join<R>}`
    : ""
  : [] extends T
  ? ""
  : string;

  export type ToArray<Arr extends readonly any[], Length = Arr["length"]> = Length extends 0
  ? []
  : Length extends 1
  ? [Arr[0]]
  : Length extends 2
  ? [Arr[0], Arr[1]]
  : Length extends 3
  ? [Arr[0], Arr[1], Arr[2]]
  : Length extends 4
  ? [Arr[0], Arr[1], Arr[2], Arr[3]]
  : Length extends 5
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4]]
  : Length extends 6
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5]]
  : Length extends 7
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6]]
  : Length extends 8
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7]]
  : Length extends 9
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7], Arr[8]]
  : Length extends 10
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7], Arr[8], Arr[9]]
  : Length extends 11
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7], Arr[8], Arr[9], Arr[10]]
  : Length extends 12
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7], Arr[8], Arr[9], Arr[10], Arr[11]]
  : Length extends 13
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7], Arr[8], Arr[9], Arr[10], Arr[11], Arr[12]]
  : Length extends 14
  ? [Arr[0], Arr[1], Arr[2], Arr[3], Arr[4], Arr[5], Arr[6], Arr[7], Arr[8], Arr[9], Arr[10], Arr[11], Arr[12], Arr[13]]
  : Length extends 15
  ? [
      Arr[0],
      Arr[1],
      Arr[2],
      Arr[3],
      Arr[4],
      Arr[5],
      Arr[6],
      Arr[7],
      Arr[8],
      Arr[9],
      Arr[10],
      Arr[11],
      Arr[12],
      Arr[13],
      Arr[14]
    ]
  : Length extends 16
  ? [
      Arr[0],
      Arr[1],
      Arr[2],
      Arr[3],
      Arr[4],
      Arr[5],
      Arr[6],
      Arr[7],
      Arr[8],
      Arr[9],
      Arr[10],
      Arr[11],
      Arr[12],
      Arr[13],
      Arr[14],
      Arr[15]
    ]
  : Length extends 17
  ? [
      Arr[0],
      Arr[1],
      Arr[2],
      Arr[3],
      Arr[4],
      Arr[5],
      Arr[6],
      Arr[7],
      Arr[8],
      Arr[9],
      Arr[10],
      Arr[11],
      Arr[12],
      Arr[13],
      Arr[14],
      Arr[15],
      Arr[16]
    ]
  : Length extends 18
  ? [
      Arr[0],
      Arr[1],
      Arr[2],
      Arr[3],
      Arr[4],
      Arr[5],
      Arr[6],
      Arr[7],
      Arr[8],
      Arr[9],
      Arr[10],
      Arr[11],
      Arr[12],
      Arr[13],
      Arr[14],
      Arr[15],
      Arr[16],
      Arr[17]
    ]
  : Length extends 19
  ? [
      Arr[0],
      Arr[1],
      Arr[2],
      Arr[3],
      Arr[4],
      Arr[5],
      Arr[6],
      Arr[7],
      Arr[8],
      Arr[9],
      Arr[10],
      Arr[11],
      Arr[12],
      Arr[13],
      Arr[14],
      Arr[15],
      Arr[16],
      Arr[17],
      Arr[18]
    ]
  : Length extends 20
  ? [
      Arr[0],
      Arr[1],
      Arr[2],
      Arr[3],
      Arr[4],
      Arr[5],
      Arr[6],
      Arr[7],
      Arr[8],
      Arr[9],
      Arr[10],
      Arr[11],
      Arr[12],
      Arr[13],
      Arr[14],
      Arr[15],
      Arr[16],
      Arr[17],
      Arr[18],
      Arr[19]
    ]
  : Arr;
