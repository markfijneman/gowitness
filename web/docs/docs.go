// Package docs Code generated by swaggo/swag. DO NOT EDIT
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "contact": {},
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/api/ping": {
            "get": {
                "description": "Returns a simple \"pong\" response to test server availability.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Health"
                ],
                "summary": "Ping the server",
                "responses": {
                    "200": {
                        "description": "pong",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/results/delete": {
            "post": {
                "description": "Deletes a result, by id, and all of its associated data from the database.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Delete a result",
                "parameters": [
                    {
                        "description": "The result ID to delete",
                        "name": "query",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.deleteResultRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "ok",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/results/detail/{id}": {
            "get": {
                "description": "Get details for a result.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Results detail",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "The screenshot ID to load.",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/models.Result"
                        }
                    }
                }
            }
        },
        "/results/gallery": {
            "get": {
                "description": "Get a paginated list of results.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Gallery",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "The page to load.",
                        "name": "page",
                        "in": "query"
                    },
                    {
                        "type": "integer",
                        "description": "Number of results per page.",
                        "name": "limit",
                        "in": "query"
                    },
                    {
                        "type": "string",
                        "description": "A comma separated list of technologies to filter by.",
                        "name": "tags",
                        "in": "query"
                    },
                    {
                        "type": "string",
                        "description": "A comma separated list of technologies to filter by.",
                        "name": "technologies",
                        "in": "query"
                    },
                    {
                        "type": "string",
                        "description": "A comma separated list of HTTP status codes to filter by.",
                        "name": "status",
                        "in": "query"
                    },
                    {
                        "type": "boolean",
                        "description": "Order the results by perception hash.",
                        "name": "perception",
                        "in": "query"
                    },
                    {
                        "type": "boolean",
                        "description": "Include failed screenshots in the results.",
                        "name": "failed",
                        "in": "query"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.galleryResponse"
                        }
                    }
                }
            }
        },
        "/results/list": {
            "get": {
                "description": "Get a simple list of all results.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Results list",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.listResponse"
                        }
                    }
                }
            }
        },
        "/results/responsecode": {
            "get": {
                "description": "Get all unique response codes.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "summary": "Get response codes",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.responseCodeListResponse"
                        }
                    }
                }
            }
        },
        "/results/tag": {
            "get": {
                "description": "Get all unique tags.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Get tag results",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.tagListResponse"
                        }
                    }
                }
            }
        },
        "/results/technology": {
            "get": {
                "description": "Get all the unique technology detected.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Get technology results",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.technologyListResponse"
                        }
                    }
                }
            }
        },
        "/runners": {
            "get": {
                "description": "Get runner statistics.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Runner statistics",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.runnersResponse"
                        }
                    }
                }
            }
        },
        "/search": {
            "post": {
                "description": "Searches for results based on free form text, or operators.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Search for results",
                "parameters": [
                    {
                        "description": "The search term to search for. Supports search operators: ` + "`" + `title:` + "`" + `, ` + "`" + `tech:` + "`" + `, ` + "`" + `header:` + "`" + `, ` + "`" + `body:` + "`" + `, ` + "`" + `p:` + "`" + `",
                        "name": "query",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.searchRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.searchResult"
                        }
                    }
                }
            }
        },
        "/statistics": {
            "get": {
                "description": "Get database statistics.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Database statistics",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/api.statisticsResponse"
                        }
                    }
                }
            }
        },
        "/submit": {
            "post": {
                "description": "Starts a new scanning routine for a list of URL's and options, writing results to the database.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Submit URL's for scanning",
                "parameters": [
                    {
                        "description": "The URL scanning request object",
                        "name": "query",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.submitRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "Probing started",
                        "schema": {
                            "type": "string"
                        }
                    }
                }
            }
        },
        "/submit/single": {
            "post": {
                "description": "Starts a new probing routine for a URL and options, returning the results when done.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Submit a single URL for probing",
                "parameters": [
                    {
                        "description": "The URL scanning request object",
                        "name": "query",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/api.submitSingleRequest"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "The URL Result object",
                        "schema": {
                            "$ref": "#/definitions/models.Result"
                        }
                    }
                }
            }
        },
        "/wappalyzer": {
            "get": {
                "description": "Get all of the available wappalyzer data.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Results"
                ],
                "summary": "Get wappalyzer data",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "type": "object",
                            "additionalProperties": {
                                "type": "string"
                            }
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "api.deleteResultRequest": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                }
            }
        },
        "api.galleryContent": {
            "type": "object",
            "properties": {
                "failed": {
                    "type": "boolean"
                },
                "file_name": {
                    "type": "string"
                },
                "id": {
                    "type": "integer"
                },
                "probed_at": {
                    "type": "string"
                },
                "response_code": {
                    "type": "integer"
                },
                "screenshot": {
                    "type": "string"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "technologies": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "title": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "api.galleryResponse": {
            "type": "object",
            "properties": {
                "limit": {
                    "type": "integer"
                },
                "page": {
                    "type": "integer"
                },
                "results": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/api.galleryContent"
                    }
                },
                "total_count": {
                    "type": "integer"
                }
            }
        },
        "api.listResponse": {
            "type": "object",
            "properties": {
                "content_length": {
                    "type": "integer"
                },
                "failed": {
                    "description": "Failed flag set if the result should be considered failed",
                    "type": "boolean"
                },
                "failed_reason": {
                    "type": "string"
                },
                "final_url": {
                    "type": "string"
                },
                "id": {
                    "type": "integer"
                },
                "protocol": {
                    "type": "string"
                },
                "response_code": {
                    "type": "integer"
                },
                "response_reason": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "api.responseCodeListResponse": {
            "type": "object",
            "properties": {
                "response_codes": {
                    "type": "array",
                    "items": {
                        "type": "integer"
                    }
                }
            }
        },
        "api.runnersResponse": {
            "type": "object",
            "properties": {
                "completed": {
                    "type": "integer"
                },
                "id": {
                    "type": "integer"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "target_count": {
                    "type": "integer"
                },
                "threads": {
                    "type": "integer"
                }
            }
        },
        "api.searchRequest": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string"
                }
            }
        },
        "api.searchResult": {
            "type": "object",
            "properties": {
                "content_length": {
                    "type": "integer"
                },
                "failed": {
                    "type": "boolean"
                },
                "failed_reason": {
                    "type": "string"
                },
                "file_name": {
                    "type": "string"
                },
                "final_url": {
                    "type": "string"
                },
                "id": {
                    "type": "integer"
                },
                "matched_fields": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "protocol": {
                    "type": "string"
                },
                "response_code": {
                    "type": "integer"
                },
                "response_reason": {
                    "type": "string"
                },
                "screenshot": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "api.statisticsResponse": {
            "type": "object",
            "properties": {
                "consolelogs": {
                    "type": "integer"
                },
                "dbsize": {
                    "type": "integer"
                },
                "headers": {
                    "type": "integer"
                },
                "networklogs": {
                    "type": "integer"
                },
                "response_code_stats": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/api.statisticsResponseCode"
                    }
                },
                "results": {
                    "type": "integer"
                }
            }
        },
        "api.statisticsResponseCode": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "integer"
                },
                "count": {
                    "type": "integer"
                }
            }
        },
        "api.submitRequest": {
            "type": "object",
            "properties": {
                "options": {
                    "$ref": "#/definitions/api.submitRequestOptions"
                },
                "urls": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "api.submitRequestOptions": {
            "type": "object",
            "properties": {
                "delay": {
                    "type": "integer"
                },
                "format": {
                    "type": "string"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "threads": {
                    "type": "integer"
                },
                "timeout": {
                    "type": "integer"
                },
                "user_agent": {
                    "type": "string"
                },
                "window_x": {
                    "type": "integer"
                },
                "window_y": {
                    "type": "integer"
                }
            }
        },
        "api.submitSingleRequest": {
            "type": "object",
            "properties": {
                "options": {
                    "$ref": "#/definitions/api.submitRequestOptions"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "api.tagListResponse": {
            "type": "object",
            "properties": {
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "api.technologyListResponse": {
            "type": "object",
            "properties": {
                "technologies": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "models.ConsoleLog": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                },
                "result_id": {
                    "type": "integer"
                },
                "type": {
                    "type": "string"
                },
                "value": {
                    "type": "string"
                }
            }
        },
        "models.Cookie": {
            "type": "object",
            "properties": {
                "domain": {
                    "type": "string"
                },
                "expires": {
                    "type": "string"
                },
                "http_only": {
                    "type": "boolean"
                },
                "id": {
                    "type": "integer"
                },
                "name": {
                    "type": "string"
                },
                "path": {
                    "type": "string"
                },
                "priority": {
                    "type": "string"
                },
                "result_id": {
                    "type": "integer"
                },
                "secure": {
                    "type": "boolean"
                },
                "session": {
                    "type": "boolean"
                },
                "size": {
                    "type": "integer"
                },
                "source_port": {
                    "type": "integer"
                },
                "source_scheme": {
                    "type": "string"
                },
                "value": {
                    "type": "string"
                }
            }
        },
        "models.Header": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                },
                "key": {
                    "type": "string"
                },
                "result_id": {
                    "type": "integer"
                },
                "value": {
                    "type": "string"
                }
            }
        },
        "models.NetworkLog": {
            "type": "object",
            "properties": {
                "content": {
                    "type": "array",
                    "items": {
                        "type": "integer"
                    }
                },
                "error": {
                    "type": "string"
                },
                "id": {
                    "type": "integer"
                },
                "mime_type": {
                    "type": "string"
                },
                "remote_ip": {
                    "type": "string"
                },
                "request_type": {
                    "$ref": "#/definitions/models.RequestType"
                },
                "result_id": {
                    "type": "integer"
                },
                "status_code": {
                    "type": "integer"
                },
                "time": {
                    "type": "string"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "models.RequestType": {
            "type": "integer",
            "enum": [
                0,
                0
            ],
            "x-enum-varnames": [
                "HTTP",
                "WS"
            ]
        },
        "models.Result": {
            "type": "object",
            "properties": {
                "console": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.ConsoleLog"
                    }
                },
                "content_length": {
                    "type": "integer"
                },
                "cookies": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Cookie"
                    }
                },
                "failed": {
                    "description": "Failed flag set if the result should be considered failed",
                    "type": "boolean"
                },
                "failed_reason": {
                    "type": "string"
                },
                "file_name": {
                    "description": "Name of the screenshot file",
                    "type": "string"
                },
                "final_url": {
                    "type": "string"
                },
                "headers": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Header"
                    }
                },
                "html": {
                    "type": "string"
                },
                "id": {
                    "type": "integer"
                },
                "is_pdf": {
                    "type": "boolean"
                },
                "network": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.NetworkLog"
                    }
                },
                "perception_hash": {
                    "type": "string"
                },
                "perception_hash_group_id": {
                    "type": "integer"
                },
                "probed_at": {
                    "type": "string"
                },
                "protocol": {
                    "type": "string"
                },
                "response_code": {
                    "type": "integer"
                },
                "response_reason": {
                    "type": "string"
                },
                "screenshot": {
                    "type": "string"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Tag"
                    }
                },
                "technologies": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.Technology"
                    }
                },
                "title": {
                    "type": "string"
                },
                "tls": {
                    "$ref": "#/definitions/models.TLS"
                },
                "url": {
                    "type": "string"
                }
            }
        },
        "models.TLS": {
            "type": "object",
            "properties": {
                "cipher": {
                    "type": "string"
                },
                "encrypted_client_hello": {
                    "type": "boolean"
                },
                "id": {
                    "type": "integer"
                },
                "issuer": {
                    "type": "string"
                },
                "key_exchange": {
                    "type": "string"
                },
                "protocol": {
                    "type": "string"
                },
                "resultid": {
                    "type": "integer"
                },
                "san_list": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/models.TLSSanList"
                    }
                },
                "server_signature_algorithm": {
                    "type": "integer"
                },
                "subject_name": {
                    "type": "string"
                },
                "valid_from": {
                    "type": "string"
                },
                "valid_to": {
                    "type": "string"
                }
            }
        },
        "models.TLSSanList": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                },
                "tls_id": {
                    "type": "integer"
                },
                "value": {
                    "type": "string"
                }
            }
        },
        "models.Tag": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                },
                "result_id": {
                    "type": "integer"
                },
                "value": {
                    "type": "string"
                }
            }
        },
        "models.Technology": {
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer"
                },
                "result_id": {
                    "type": "integer"
                },
                "value": {
                    "type": "string"
                }
            }
        }
    }
}`

// SwaggerInfo holds exported Swagger Info so clients can modify it
var SwaggerInfo = &swag.Spec{
	Version:          "",
	Host:             "",
	BasePath:         "",
	Schemes:          []string{},
	Title:            "",
	Description:      "",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
