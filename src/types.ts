import type { Location } from 'react-router-dom';

/** 写入 history state 的导航附加信息。 */
export interface PortalLocationState {
  /** 存在时表示当前条目以模态层展示，backgroundLocation 是模态层背后的页面 */
  backgroundLocation?: Location;
  /** 覆盖层导航（抽屉/模态）：不重置底层页面滚动 */
  overlay?: boolean;
  /** “继续学习”导航：恢复该路径上次的滚动位置 */
  resume?: boolean;
  /** 覆盖层关闭后需要归还焦点的元素 data-focus-id */
  returnFocusId?: string;
  /** 重定向到目录时携带的提示信息 */
  notice?: string;
}
