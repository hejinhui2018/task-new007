/**
 * 标记应用是否已经完成首次挂载。
 * 页面主标题只在客户端导航后抢焦点，首次加载保持浏览器默认行为。
 */
let mounted = false;

export function markAppMounted(): void {
  mounted = true;
}

export function appHasMounted(): boolean {
  return mounted;
}

/** 仅供测试在每个用例前重置。 */
export function resetAppLifecycleForTests(): void {
  mounted = false;
}
