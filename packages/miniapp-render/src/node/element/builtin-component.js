import Element from '../element';
import cache from '../../util/cache';
import Pool from '../../util/pool';

const pool = new Pool();

class BuiltInComponent extends Element {
  /**
     * 创建实例
     */
  static $$create(options, tree) {
    const config = cache.getConfig();

    if (config.optimization.elementMultiplexing) {
      // 复用 element 节点
      const instance = pool.get();

      if (instance) {
        instance.$$init(options, tree);
        return instance;
      }
    }

    return new BuiltInComponent(options, tree);
  }

  /**
     * 覆写父类的回收实例方法
     */
  $$recycle() {
    this.$$destroy();

    const config = cache.getConfig();

    if (config.optimization.elementMultiplexing) {
      // 复用 element 节点
      pool.add(this);
    }
  }

  get behavior() {
    return this.$_attrs.get('behavior') || '';
  }

  set behavior(value) {
    if (typeof value !== 'string') return;

    this.$_attrs.set('behavior', value);
  }
}

export default BuiltInComponent;
