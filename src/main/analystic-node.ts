// Telemetry stripped: this fork does not send analytics events anywhere.
// The function is kept as a no-op so existing call sites keep compiling.
export async function event(_name: string, _params: any = {}) {}
