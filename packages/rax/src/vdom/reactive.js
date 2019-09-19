import Host from './host';
import Component from './component';
import invokeFunctionsWithContext from '../invokeFunctionsWithContext';
import { invokeMinifiedError } from '../error';
import { INTERNAL } from '../constant';

const RE_RENDER_LIMIT = 24;
/**
 * Functional Reactive Component Class Wrapper
 */
export default class ReactiveComponent extends Component {
  constructor(pureRender, ref) {
    super();
    // Marked ReactiveComponent.
    this.__isReactiveComponent = true;
    // A pure function
    this.__render = pureRender;
    this.__hookID = 0;
    // Number of rerenders
    this.__reRenders = 0;
    this.__hooks = {};
    // Is render scheduled
    this.__isScheduled = false;
    this.__shouldUpdate = false;
    this.__children = null;
    this.__dependencies = {};
    // Handles store
    this.didMount = [];
    this.didUpdate = [];
    this.willUnmount = [];

    this.state = {};

    if (pureRender.__forwardRef) {
      this.__prevForwardRef = this.__forwardRef = ref;
    }

    const compares = pureRender.__compares;
    if (compares) {
      this.shouldComponentUpdate = (nextProps) => {
        // Process composed compare
        let arePropsEqual = true;

        // Compare push in and pop out
        for (let i = compares.length - 1; i > -1; i--) {
          if (arePropsEqual = compares[i](this.props, nextProps)) {
            break;
          }
        }

        return !arePropsEqual || this.__prevForwardRef !== this.__forwardRef;
      };
    }
  }

  getHooks() {
    return this.__hooks;
  }

  getHookID() {
    return ++this.__hookID;
  }

  useContext(context) {
    const contextName = context._contextName;
    const internalContext = this[INTERNAL]._context;
    if (internalContext[contextName]) {
      return internalContext[contextName].getValue();
    } else {
      return context._defaultValue;
    }
  }

  componentWillMount() {
    this.__shouldUpdate = true;
  }

  componentDidMount() {
    invokeFunctionsWithContext(this.didMount);
  }

  componentWillReceiveProps() {
    this.__shouldUpdate = true;
  }

  componentDidUpdate() {
    invokeFunctionsWithContext(this.didUpdate);
  }

  componentWillUnmount() {
    invokeFunctionsWithContext(this.willUnmount);
  }

  update() {
    this[INTERNAL].__isPendingForceUpdate = true;
    this.setState({});
  }

  render() {
    if (process.env.NODE_ENV !== 'production') {
      Host.measurer && Host.measurer.beforeRender();
    }

    this.__hookID = 0;
    this.__reRenders = 0;
    this.__isScheduled = false;
    let children = this.__render(this.props, this.__forwardRef ? this.__forwardRef : this.context);

    while (this.__isScheduled) {
      this.__reRenders++;
      if (this.__reRenders > RE_RENDER_LIMIT) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error('Too many re-renders, the number of renders is limited to prevent an infinite loop.');
        } else {
          invokeMinifiedError(4);
        }
      }

      this.__hookID = 0;
      this.__isScheduled = false;
      children = this.__render(this.props, this.__forwardRef ? this.__forwardRef : this.context);
    }

    if (this.__shouldUpdate) {
      this.__children = children;
      this.__shouldUpdate = false;
    }

    return this.__children;
  }
}
