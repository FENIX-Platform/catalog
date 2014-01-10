package org.fao.fenix.catalog.dto;

public class ResponseMessage {

    private MessageCode code;
    private String message;

    public ResponseMessage() { }
    public ResponseMessage(MessageCode code, String message) {
        this.code = code;
        this.message = message;
    }


    public MessageCode getCode() {
        return code;
    }

    public void setCode(MessageCode code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
