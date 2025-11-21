import { StrokeState, StrokeInfo } from './types';

export const STROKES: StrokeInfo[] = [
  {
    id: StrokeState.Intake,
    title: "进气冲程 (Intake)",
    description: "进气门打开，排气门关闭。活塞向下运动，气缸内产生负压，将空气和燃料混合气吸入气缸。",
    color: "#3b82f6", // Blue
    startAngle: 0,
    endAngle: 180
  },
  {
    id: StrokeState.Compression,
    title: "压缩冲程 (Compression)",
    description: "进气门和排气门都关闭。活塞向上运动，压缩混合气体，使其温度和压力升高。",
    color: "#eab308", // Yellow/Gold
    startAngle: 180,
    endAngle: 360
  },
  {
    id: StrokeState.Power,
    title: "做功冲程 (Power)",
    description: "火花塞点燃压缩混合气，产生猛烈爆炸。高温高压气体推动活塞向下猛烈运动，通过连杆带动曲轴旋转对外做功。",
    color: "#ef4444", // Red
    startAngle: 360,
    endAngle: 540
  },
  {
    id: StrokeState.Exhaust,
    title: "排气冲程 (Exhaust)",
    description: "进气门关闭，排气门打开。活塞向上运动，将燃烧后的废气排出气缸，准备下一个循环。",
    color: "#64748b", // Slate/Grey
    startAngle: 540,
    endAngle: 720
  }
];

export const FULL_CYCLE_RAD = 4 * Math.PI; // 720 degrees
export const BASE_RPM = 0.05; // Base rotation speed per frame

export const PART_INFO: Record<string, { title: string; description: string }> = {
  piston: { title: "活塞 (Piston)", description: "承受燃烧压力，在气缸内往复运动，将热能转化为机械能。" },
  rod: { title: "连杆 (Connecting Rod)", description: "连接活塞与曲轴，将活塞的往复直线运动转化为曲轴的旋转运动。" },
  crank: { title: "曲轴 (Crankshaft)", description: "发动机的主要旋转部件，将连杆传来的力转化为扭矩输出。" },
  intakeValve: { title: "进气门 (Intake Valve)", description: "控制燃油混合气进入气缸，仅在进气冲程开启。" },
  exhaustValve: { title: "排气门 (Exhaust Valve)", description: "控制燃烧废气排出气缸，仅在排气冲程开启。" },
  sparkPlug: { title: "火花塞 (Spark Plug)", description: "产生电火花点燃压缩的混合气体，引发做功冲程。" },
  head: { title: "气缸盖 (Cylinder Head)", description: "封闭气缸上部，构成燃烧室，安装有气门和火花塞。" },
  cylinder: { title: "气缸 (Cylinder)", description: "引导活塞作往复运动的圆筒形空腔。" }
};
