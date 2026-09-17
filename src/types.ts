import type { Location } from 'react-router-dom';

/**
 * 通过 navigate 的 state 传递的导航意图：
 * - background：存在时表示当前章节地址应以模态层形式盖在该背景页之上；
 * - resume：表示本次进入章节页是“继续学习”，需要恢复到上次阅读位置。
 */
export interface PortalLocationState {
  background?: Location;
  resume?: boolean;
}
