import { Sequelize, DataTypes, Model } from "sequelize";
export const sequelize = new Sequelize("sqlite::memory", { logging: false });
export const batchSize = 5;

export class User extends Model {}
User.init(
  {
    // Model attributes are defined here
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: false,
  }
);

let watermarkData = null;
export async function getWatermark() {
  return watermarkData;
}
export async function setWatermark(value) {
  if (!value) {
    // console.log("setWatermark", "null");
    watermarkData = null;
  } else {
    // console.log("setWatermark", value);
    watermarkData = value;
  }
}

export async function dumpDb() {
  const rows = await User.findAll();
  for (let row of rows) {
    console.log(row.id, row.version, row.updatedAt);
  }
}
