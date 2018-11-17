const storage = () => {
  return async (ctx, next) => {
    if (ctx.get('x-requested-with')) {
      return next();
    }
    if (!ctx.storage) {
      ctx.storage = (() => {
        const _store = {};
        return {
          get: (name, _default = undefined) => _store[name] ? _store[name] : _default,
          set: (name, value) => _store[name] = value
        };
      })();
    }
    return next();
  };
};

export { storage };
