package org.fao.fenix.catalog.search.dto;

public class Filter {

    private Require require;
    private ResourceFilter filter;
    private int startIndex = 0;
    private int pageSize = 0;
    private RequiredPlugin[] business;


    public Require getRequire() {
        return require;
    }

    public void setRequire(Require require) {
        this.require = require;
    }

    public ResourceFilter getFilter() {
        return filter;
    }

    public void setFilter(ResourceFilter filter) {
        this.filter = filter;
    }

    public int getStartIndex() {
        return startIndex;
    }

    public void setStartIndex(int startIndex) {
        this.startIndex = startIndex;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public RequiredPlugin[] getBusiness() {
        return business;
    }

    public void setBusiness(RequiredPlugin[] business) {
        this.business = business;
    }
}
