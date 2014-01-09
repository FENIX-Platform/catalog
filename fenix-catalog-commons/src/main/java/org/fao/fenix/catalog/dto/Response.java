package org.fao.fenix.catalog.dto;

import org.fao.fenix.catalog.dto.data.Resource;

import java.util.Collection;

public class Response {

    private Integer count;
    private Collection<Resource> resources;
    private ResponseMessage message;

    public Collection<Resource> getResources() {
        return resources;
    }

    public void setResources(Collection<Resource> resources) {
        this.resources = resources;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public ResponseMessage getMessage() {
        return message;
    }

    public void setMessage(ResponseMessage message) {
        this.message = message;
    }
}
