/**
 * @Description: ID校验器
 * @Author: 小钦var
 * @Date: 2023/10/13 16:16
 */
import ObjectID from "bson-objectid";
import { registerDecorator } from "class-validator";

export function IsObjectID() {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: "isObjectID", // 装饰器名
      target: target.constructor,
      propertyName: propertyName,
      validator: {
        validate(value: string) {
          return ObjectID.isValid(value);
        },
      },
    });
  };
}
