export enum eToast {
  KEEP_ALIVE = -1,
  NORMAL     =  0,
  WARNING    =  1,
  ERROR      =  2,
  SUCCESS    =  3
}

export class Toast {
  title:    string
  message:  string
  duration: number
  type:     eToast

  // Constructor
  constructor(msg: string, type: eToast = eToast.NORMAL) {
    switch (type) {
      case eToast.NORMAL:
        this.title    = "Thông báo"
        this.duration = 5000
        break
      case eToast.ERROR:
        this.title    = "Lỗi"
        this.duration = 10000
        break
      case eToast.WARNING:
        this.title    = "Cảnh báo"
        this.duration = 7000
        break
      case eToast.SUCCESS:
        this.title    = "Thành công"
        this.duration = 5000
        break
      default:
        break
    }
    this.message = msg
    this.type    = type
  }
}
