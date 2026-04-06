// 缺失依赖的类型声明
// 这些依赖在演示模式下不需要，但 TypeScript 需要类型声明

declare module 'react-beautiful-dnd' {
  export const DragDropContext: any;
  export const Droppable: any;
  export const Draggable: any;
  export interface DropResult {
    destination?: {
      index: number;
    };
    source: {
      index: number;
    };
  }
}

declare module 'antd' {
  export const Card: any;
  export const Button: any;
  export const DatePicker: any;
  export const Select: any;
  export const Table: any;
  export const message: any;
  export const Space: any;
  export const Typography: any;
  export const Row: any;
  export const Col: any;
  export const Grid: any;
  export const Statistic: any;
  export const List: any;
  export const Tag: any;
  export const Spin: any;
  export const Tabs: any;
  export const RangePicker: any;
  export const TabPane: any;
  export const Option: any;
}

declare module '@ant-design/icons' {
  export const FileTextOutlined: any;
  export const DownloadOutlined: any;
  export const ReloadOutlined: any;
  export const PieChartOutlined: any;
  export const BarChartOutlined: any;
  export const UserOutlined: any;
  export const EyeOutlined: any;
  export const LikeOutlined: any;
  export const ShareAltOutlined: any;
  export const SyncOutlined: any;
  export const RiseOutlined: any;
}
