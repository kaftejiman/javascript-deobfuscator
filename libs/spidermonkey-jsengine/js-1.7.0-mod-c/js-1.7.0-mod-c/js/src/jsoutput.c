#include "jsstddef.h"
#include "jslibmath.h"
#include <stdlib.h>
#include <string.h>
#include "jstypes.h"
#include "jslong.h"
#include "prmjtime.h"
#include "jsapi.h"
#include "jsatom.h"
#include "jscntxt.h"
#include "jsconfig.h"
#include "jslock.h"
#include "jsmath.h"
#include "jsdocument.h"
#include "jsnum.h"
#include "jsobj.h"
#include "jsoutput.h"

void OutputHex(jschar *s, size_t n, char *sMessage, int iVerbose)
{
    size_t i;

    if (iVerbose)
    {
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
        fprintf(stdout, "// %s size = %d\n", sMessage, n);
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
    }
    for (i = 0; i < n; i++)
    {
        fprintf(stdout, "%02x", s[i]);
        if ((i + 1) % 16 != 0)
            fprintf(stdout, " ");
        else
            fprintf(stdout, "\n");
    }
    if (n % 16 != 0)
        fprintf(stdout, "\n");
    if (iVerbose)
    {
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
    }
}

void OutputASCII(jschar *s, size_t n, char *sMessage, int iVerbose)
{
    char sASCII[17];
    size_t i;

    if (iVerbose)
    {
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
        fprintf(stdout, "// %s size = %d\n", sMessage, n);
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
    }
    strcpy(sASCII, "................");
    for (i = 0; i < n; i++)
    {
        if (i % 16 == 0)
            fprintf(stdout, "%08x:", i);
        fprintf(stdout, " %02x", s[i]);
        if (isprint((char)s[i]))
            sASCII[i % 16] = (char)s[i];
        if ((i + 1) % 16 == 0)
            fprintf(stdout, " %s\n", sASCII);
    }
    if (n % 16 != 0)
    {
        sASCII[n % 16] = '\0';
        for (i = 0; i < 16 - n % 16; i++)
            fprintf(stdout, "   ");
        fprintf(stdout, " %s\n", sASCII);
    }
    if (iVerbose)
    {
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
    }
}

void OutputDump(jschar *s, size_t n, char *sMessage, int iVerbose)
{
    if (iVerbose)
    {
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
        fprintf(stdout, "// %s size = %d\n", sMessage, n);
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
        fprintf(stdout, "%S\n", s);
        fprintf(stdout, "// ----------------------------------------------------------------------------\n");
    }
    else
        fprintf(stdout, "%S", s);
}
