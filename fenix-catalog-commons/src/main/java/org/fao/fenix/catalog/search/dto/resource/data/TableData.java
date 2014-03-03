package org.fao.fenix.catalog.search.dto.resource.data;

import org.fao.fenix.catalog.search.dto.resource.index.Index;
import org.fao.fenix.catalog.search.dto.resource.dsd.ResourceDSD;
import org.fao.fenix.catalog.search.dto.resource.dsd.TableDSD;

import java.util.Map;

public class TableData extends StandardData {

    private TableDSD DSD;
    private Iterable<Object[]> data;

    public TableData() { }
    public TableData(String name, String resourceType, String sourceName, Index index, Object metadata, TableDSD DSD, Iterable<Object[]> data, Integer size) {
        super(name,resourceType,sourceName,index,metadata, size);

        if ((this.data = data)!=null)
            this.DSD = DSD!=null ? DSD : new TableDSD();
    }

    @Override
    public DataType getDataType() {
        return DataType.table;
    }

    @Override
    public Object getData() {
        return data;
    }

    @Override
    public ResourceDSD getDSD() {
        return DSD;
    }

    //Utils
    public void addColumn(String columnName, Map<String,Object> columnMetadata) {
        DSD.put(columnName, columnMetadata);
    }

}
