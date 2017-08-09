
## Next Version

* [BREAK CHANGE] 同名 reducer 和 effect 不会 fallthrough，仅执行 effect
* take effect 会自动加上 namespace prefix，所以之前手动加 namespace 的会收到一个 warning
* `dispatch(EffectAction)` 会返回 Promise
* effect 前后会额外触发 `/@@start` 和 `/@@end` 的 action，可以利用此约定实现 put 的同步执行
