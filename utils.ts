export function setter(obj: any, key: string | number, value: any) {
  return obj[key] = value;
}

export function sleep(timeOut: number): Promise<void> {
  return new Promise((a) => setTimeout(a, timeOut));
}


export function merge<T extends object>(
  left: T,
  right: T,
  preserve = false,
  ignoreNewProps = false
) {
  if (right instanceof Array && left instanceof Array) {
    for (let i = 0, maxLength = Math.max(right.length, left.length), leftValue: any, rightValue: any; (rightValue = right[i]), (leftValue = left[i]), i < maxLength; i++)
      if (!preserve && leftValue === undefined)
        setter(left, i, rightValue);
      else if (leftValue && rightValue)
        setter(
          left,
          i,
          merge(leftValue, rightValue, preserve, ignoreNewProps)
        );
  } else if (right instanceof Date && left instanceof Date) {
    if (!preserve)
      return right;
  } else if (right as any instanceof Object && left as any instanceof Object) {
    for (const rightKey in right) {
      if (!ignoreNewProps || rightKey in left as any)
        setter(
          left as object,
          rightKey as string,
          rightKey in left as any
            ? merge((left as any)[rightKey as string], (right as any)[rightKey as string], preserve, ignoreNewProps)
            : (right as any)[rightKey as string]
        );
    }
  } else if (!preserve || left === undefined) {
    return right;
  }
  return left;
}
