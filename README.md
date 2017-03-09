# Mapping properties from source object to destination type

# Usage

1. Create example types:

```typescript
class A {
    public x:number = 1;
    public y:number = 2;
}

class B {
    public x:string;
    public y:number;
}
```

2. Create map configuration

```typescript
import { Mapper } from 'mapper';

Mapper.createMap(A, B)
    .forMember(dst => dst.x, src => typeof src.x === 'number' ? src.x.toString() : null )
    .forMember(dst => dst.y, src => src.y);
```

3. Usage mapping

```typescript
import { Mapper } from 'mapper';

let a = new A();
let b = Mapper.map(a, B);

console.log(b instanceof B); // true
console.log(b.x); // "1"
console.log(b.y); // 2
```
