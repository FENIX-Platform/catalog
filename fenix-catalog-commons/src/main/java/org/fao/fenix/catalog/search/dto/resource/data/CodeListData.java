package org.fao.fenix.catalog.search.dto.resource.data;

import org.fao.fenix.catalog.search.dto.resource.index.Index;
import org.fao.fenix.catalog.search.dto.resource.dsd.CodeListDSD;
import org.fao.fenix.catalog.search.dto.resource.dsd.ResourceDSD;

public class CodeListData extends StandardData {

    private CodeListDSD DSD;
    private Object data;

    public CodeListData() { }
    public CodeListData(String name, String resourceType, String sourceName, Index index, Object metadata, CodeListDSD DSD, Object data, Integer size) {
        super(name,resourceType,sourceName,index,metadata,size);

        if ((this.data = data)!=null)
            this.DSD = DSD!=null ? DSD : new CodeListDSD();
    }

    @Override
    public DataType getDataType() {
        return DataType.tree;
    }

    @Override
    public Object getData() {
        return data;
    }

    @Override
    public ResourceDSD getDSD() {
        return DSD;
    }





}
