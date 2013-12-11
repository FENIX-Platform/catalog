FENIX Catalog
=============

**Caution**: This repository is still on testing phase.

### Summary

#### [Interface Contract](README.md)

``{
	"filter" 	: [
					{"type" 	: "possible_type",
					"metadata" 	: [ 
									{"title" 		: ["my_title", ...],
									 "updateDate" 	: [{"from" 	: "from_value",
									 					"to" 	: "to_value"}, ...],
									 "source"		: ["my_source", ...],
									 ...
									 }
								],
					"data"	 	: [ 
									{"title" 		: ["my_title", ...],
									 "updateDate" 	: [{"from" 	: "from_value",
									 					"to" 	: "to_value"}, ...],
									 "source"		: ["my_source", ...],
									 ...
									 }
								],
					"business"	: [
									{"id" 		: "my_business_filter_Id",
									 "param_1" 	: "value"}, ...
									]
					}
				],
	"startIndex":
	"pageSize":
	"require"	: {
					"index" : boolean,
					"data"	: true/false/["",...]
					},
	"business"	: [
					{"id" 		: "my_business_filter_Id",
					 "param_1" 	: "value"}, ...
					]
}

{text, like, fulltext, regexp}
{numbers range, date range}
{id}
{nested filter}
``
