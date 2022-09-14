typedef enum {OUTPUT_FILE, OUTPUT_HEX, OUTPUT_ASCII, OUTPUT_DUMP, OUTPUT_HEX_ONLY, OUTPUT_ASCII_ONLY, OUTPUT_DUMP_ONLY} type_output;
extern type_output iOutput;
#define STR_OUTPUT_FILE "f"
#define STR_OUTPUT_HEX "x"
#define STR_OUTPUT_ASCII "a"
#define STR_OUTPUT_DUMP "d"
#define STR_OUTPUT_HEX_ONLY "X"
#define STR_OUTPUT_ASCII_ONLY "A"
#define STR_OUTPUT_DUMP_ONLY "D"

void OutputHex(jschar *s, size_t n, char *sMessage, int iVerbose);
void OutputASCII(jschar *s, size_t n, char *sMessage, int iVerbose);
void OutputDump(jschar *s, size_t n, char *sMessage, int iVerbose);