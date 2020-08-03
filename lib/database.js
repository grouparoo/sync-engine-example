import { Sequelize, DataTypes, Model } from "sequelize";
export const sequelize = new Sequelize("sqlite::memory", { logging: false });

export class User extends Model {}
User.init(
  {
    // Model attributes are defined here
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
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
    watermarkData = null;
  } else {
    watermarkData = value;
  }
}
