// Misma forma que ApiResponse<T> del back (Status, Value, Msg)
export interface ApiResponse<T> {
    status: boolean;
    value: T | null;
    msg: string;
}
