package org.fao.fenix.catalog.search.dto;

import org.fao.fenix.d3s.search.dto.valueFilters.ColumnValueFilter;

import java.util.Collection;
import java.util.LinkedHashMap;

public class ResourceFilter {
    private String[] types = new String[] {"dataset","codelist","layer"};
    private QueryString queryString;
    private LinkedHashMap<String, Collection<ColumnValueFilter>> metadata = new LinkedHashMap<>();
    private LinkedHashMap<String, Collection<ColumnValueFilter>> data = new LinkedHashMap<>();
    private RequiredPlugin[] business;



    public String[] getTypes() { return types; }

    public void setTypes(String[] types) {
        if (types!=null && types.length>0)
            this.types = types;
    }

    public LinkedHashMap<String, Collection<ColumnValueFilter>> getMetadata() {
        return metadata;
    }

    public void setMetadata(LinkedHashMap<String, Collection<ColumnValueFilter>> metadata) {
        this.metadata = metadata;
    }

    public LinkedHashMap<String, Collection<ColumnValueFilter>> getData() {
        return data;
    }

    public void setData(LinkedHashMap<String, Collection<ColumnValueFilter>> data) {
        this.data = data;
    }

    public RequiredPlugin[] getBusiness() {
        return business;
    }

    public void setBusiness(RequiredPlugin[] business) {
        this.business = business;
    }

    public QueryString getQueryString() { return queryString; }

    public void setQueryString(QueryString queryString) { this.queryString = queryString; }
}
