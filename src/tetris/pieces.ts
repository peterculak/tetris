import { MatrixRow } from "./tetris";

export type Piece = Array<MatrixRow>;
export enum PieceType {
  T = "T",
  O = "O",
  L = "L",
  J = "J",
  I = "I",
  S = "S",
  Z = "Z",
}

export type PieceTypes = {
  -readonly [K in PieceType]: Piece;
};

const PIECE_T: Piece = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const PIECE_O: Piece = [
  [2, 2],
  [2, 2],
];

const PIECE_L: Piece = [
  [0, 3, 0],
  [0, 3, 0],
  [0, 3, 3],
];

const PIECE_J: Piece = [
  [0, 4, 0],
  [0, 4, 0],
  [4, 4, 0],
];

const PIECE_I: Piece = [
  [0, 5, 0, 0],
  [0, 5, 0, 0],
  [0, 5, 0, 0],
  [0, 5, 0, 0],
];

const PIECE_S: Piece = [
  [0, 6, 6],
  [6, 6, 0],
  [0, 0, 0],
];

const PIECE_Z: Piece = [
  [7, 7, 0],
  [0, 7, 7],
  [0, 0, 0],
];

export const pieces: PieceTypes = {
  T: PIECE_T,
  O: PIECE_O,
  L: PIECE_L,
  J: PIECE_J,
  I: PIECE_I,
  S: PIECE_S,
  Z: PIECE_Z,
};

function createPiece(type: PieceType): Piece {
  if (!Object.values(PieceType).includes(type)) {
    throw new Error(`Invalid type '${type}'`);
  }

  return pieces[type];
}

export function randomPiece(): Piece {
  const pieces = Object.values(PieceType);
  return createPiece(
    PieceType[pieces[Math.floor(pieces.length * Math.random())]]
  );
}
