/**
 * 浮层（模态层 / 抽屉）打开前的焦点元素栈。
 * 浮层可以嵌套（模态层里再开抽屉），关闭时按 LIFO 顺序把焦点还给触发元素。
 */
const stack: HTMLElement[] = [];

export const focusMemory = {
  push(element: HTMLElement | null): void {
    if (element) stack.push(element);
  },
  /** 弹出栈顶第一个仍存在于文档中的元素；已卸载的元素直接丢弃。 */
  pop(): HTMLElement | null {
    while (stack.length > 0) {
      const element = stack.pop()!;
      if (document.contains(element)) return element;
    }
    return null;
  },
};
