// Hình dạng block do API public trả về: chữ đã được backend giải sẵn thành chuỗi.
export interface PublicBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface PublicPage {
  pageKey: string;
  blocks: PublicBlock[];
}
