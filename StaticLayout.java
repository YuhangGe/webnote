class
StaticLayout:virtual public Layout
{
    /*
    public StaticLayout(CharSequence source, TextPaint paint,
                        int width,
                        Alignment align, float spacingmult, float spacingadd,
                        boolean includepad) {
        this(source, 0, source.length(), paint, width, align,
             spacingmult, spacingadd, includepad);
    }

    public StaticLayout(CharSequence source, int bufstart, int bufend,
                        TextPaint paint, int outerwidth,
                        Alignment align,
                        float spacingmult, float spacingadd,
                        boolean includepad) {
        this(source, bufstart, bufend, paint, outerwidth, align,
             spacingmult, spacingadd, includepad, null, 0);
    }
*/
    public:
    StaticLayout(SpannableStringBuilder source, int bufstart, int bufend,
                        TextPaint paint, int outerwidth,
                        float spacingmult, float spacingadd):
                        Layout(source, paint, outerwidth, spacingmult, spacingadd)
    {
        mLines = new int[idealIntArraySize(2 * COLUMNS_NORMAL)];

        generate(source, bufstart, bufend, paint, outerwidth, 
                 spacingmult, spacingadd, false);

        mChs = null;
        mWidths = null;
    }

    ~StaticLayout()
    {
        if(mLines != null)
        {
            delete[] mLines;
            mLines = null;
        }
    }
    
    /* package */ void generate(SpannableStringBuilder source, int bufstart, int bufend,
                        TextPaint paint, int outerwidth,
                        float spacingmult, float spacingadd,
                        boolean trackpad) {
        mLineCount = 0;

        int v = 0;
        boolean needMultiply = (spacingmult != 1 || spacingadd != 0);

        int end = source.indexOf('\n', bufstart, bufend);
        int bufsiz = end >= 0 ? end - bufstart : bufend - bufstart;
        boolean first = true;

        if (mChs == null) {
            mChs = new char[idealCharArraySize(bufsiz + 1)];//需要布局的第一行
            mWidths = new float[idealIntArraySize((bufsiz + 1) * 2)];
        }

        char[] chs = mChs;
        float[] widths = mWidths;

        for (int start = bufstart; start <= bufend; start = end) 
        {
        //循环的每次处理一行
            if (first)
                first = false;
            else
                end = source.indexOf('\n', start, bufend);

            if (end < 0)
                end = bufend;
            else
                end++;//跳到下一行

            if (end - start > chs.length) {
                chs = new char[idealCharArraySize(end - start)];
                mChs = chs;//这里是为了内存分配的优化，没什么大用处
            }
            if ((end - start) * 2 > widths.length) {
                widths = new float[idealIntArraySize((end - start) * 2)];
                mWidths = widths;
            }

            source.getChars(start, end, chs, 0);
            final int n = end - start;

            // Ensure that none of the underlying characters are treated
            // as viable breakpoints, and that the entire run gets the
            // same bidi direction.

            float w = 0;
            int here = start;

            int ok = start;
            int okascent = 0, okdescent = 0, oktop = 0, okbottom = 0;

            int fit = start;
            int fitascent = 0, fitdescent = 0, fittop = 0, fitbottom = 0;

            boolean tab = false;

            int next;
            for (int i = start; i < end; i = next) {
                    next = source.nextSpanTransition(i, end,
                                                      MetricAffectingSpan.
                                                      class);

                    getTextWidths(paint, mWorkPaint,
                                         source, i, next,
                                         widths);
                    System.arraycopy(widths, 0, widths,
                                     end - start + (i - start), next - i);

                int fmtop = paint.top;
                int fmbottom = paint.bottom;
                int fmascent = paint.ascent;
                int fmdescent = paint.descent;

                for (int j = i; j < next; j++) {
                    char c = chs[j - start];
                    if (c == '\n') {
                        ;
                    } else if (c == '\t') {
                        w = Layout.nextTab(source, start, end, w, null);//等价于w = w + tab长度
                        tab = true;
                    } else {
                        w += widths[j - start + (end - start)];
                    }

                    // Log.e("text", "was " + before + " now " + w + " after " + c + " within " + width);

                    if (w <= outerwidth) 
                    {
                        fit = j + 1;

                        if (fmtop < fittop)
                            fittop = fmtop;
                        if (fmascent < fitascent)
                            fitascent = fmascent;
                        if (fmdescent > fitdescent)
                            fitdescent = fmdescent;
                        if (fmbottom > fitbottom)
                            fitbottom = fmbottom;

                        /*
                         * From the Unicode Line Breaking Algorithm:
                         * (at least approximately)
                         *  
                         * .,:; are class IS: breakpoints
                         *      except when adjacent to digits
                         * /    is class SY: a breakpoint
                         *      except when followed by a digit.
                         * -    is class HY: a breakpoint
                         *      except when followed by a digit.
                         *
                         * Ideographs are class ID: breakpoints when adjacent,
                         * except for NS (non-starters), which can be broken
                         * after but not before.
                         */

                        if (c == ' ' || c == '\t' ||
                            ((c == '.'  || c == ',' || c == ':' || c == ';') &&
                             (j - 1 < here || !Character.isDigit(chs[j - 1 - start])) &&
                             (j + 1 >= next || !Character.isDigit(chs[j + 1 - start]))) 
                             
                             
                             ||
                            ((c == '/' || c == '-') &&
                             (j + 1 >= next || !Character.isDigit(chs[j + 1 - start]))) 
                             
                             
                             ||
                            (c >= FIRST_CJK && isIdeographic(c, true) &&
                             j + 1 < next && isIdeographic(chs[j + 1 - start], false))) {
                             
                             
                            ok = j + 1;

                            if (fittop < oktop)
                                oktop = fittop;
                            if (fitascent < okascent)
                                okascent = fitascent;
                            if (fitdescent > okdescent)
                                okdescent = fitdescent;
                            if (fitbottom > okbottom)
                                okbottom = fitbottom;
                        }
                    } else {
                        if (ok != here) {
                            // Log.e("text", "output ok " + here + " to " +ok);

                            while (ok < next && chs[ok - start] == ' ') {
                                ok++;
                            }

                            v = out(source,
                                    here, ok,
                                    okascent, okdescent, oktop, okbottom,
                                    v,
                                    spacingmult, spacingadd, tab,
                                    needMultiply,
                                    ok == bufend, trackpad);

                            here = ok;
                        } else if (fit != here) {
                            // Log.e("text", "output fit " + here + " to " +fit);
                            v = out(source,
                                    here, fit,
                                    fitascent, fitdescent,
                                    fittop, fitbottom,
                                    v,
                                    spacingmult, spacingadd, tab,
                                    needMultiply, 
                                    fit == bufend, trackpad);

                            here = fit;
                        } else {
                            // Log.e("text", "output one " + here + " to " +(here + 1));
                            measureText(paint, mWorkPaint,
                                        source, here, here + 1, tab,
                                        null);

                            v = out(source,
                                    here, here+1,
                                    paint.ascent, paint.descent,
                                    paint.top, paint.bottom,
                                    v,
                                    spacingmult, spacingadd, tab,
                                    needMultiply,
                                    here + 1 == bufend, 
                                    trackpad);

                            here = here + 1;
                        }

                        if (here < i) {
                            j = next = here; // must remeasure
                        } else {
                            j = here - 1;    // continue looping
                        }

                        ok = fit = here;
                        w = 0;
                        fitascent = fitdescent = fittop = fitbottom = 0;
                        okascent = okdescent = oktop = okbottom = 0;
                    }
                }
            }

            if (end != here) {
                if ((fittop | fitbottom | fitdescent | fitascent) == 0) {
                    fittop = paint.top;
                    fitbottom = paint.bottom;
                    fitascent = paint.ascent;
                    fitdescent = paint.descent;
                }

                // Log.e("text", "output rest " + here + " to " + end);

                v = out(source,
                        here, end, fitascent, fitdescent,
                        fittop, fitbottom,
                        v,
                        spacingmult, spacingadd, tab,
                        needMultiply,
                        end == bufend, trackpad);
            }

            start = end;

            if (end == bufend)
                break;
        }

        if (bufend == bufstart || source.charAt(bufend - 1) == '\n') {
            // Log.e("text", "output last " + bufend);

            v = out(source,
                    bufend, bufend, paint.ascent, paint.descent,
                    paint.top, paint.bottom,
                    v,
                    spacingmult, spacingadd, false,
                    needMultiply
                    true, trackpad);
        }
    }

    private static final char FIRST_CJK = '\u2E80';
    /**
     * Returns true if the specified character is one of those specified
     * as being Ideographic (class ID) by the Unicode Line Breaking Algorithm
     * (http://www.unicode.org/unicode/reports/tr14/), and is therefore OK
     * to break between a pair of.
     *
     * @param includeNonStarters also return true for category NS
     *                           (non-starters), which can be broken
     *                           after but not before.
     */
    boolean isIdeographic(char c, boolean includeNonStarters) {
        if (c >= '\u2E80' && c <= '\u2FFF') {
            return true; // CJK, KANGXI RADICALS, DESCRIPTION SYMBOLS
        }
        if (c == '\u3000') {
            return true; // IDEOGRAPHIC SPACE
        }
        if (c >= '\u3040' && c <= '\u309F') {
            if (!includeNonStarters) {
                switch (c) {
                case '\u3041': //  # HIRAGANA LETTER SMALL A
                case '\u3043': //  # HIRAGANA LETTER SMALL I
                case '\u3045': //  # HIRAGANA LETTER SMALL U
                case '\u3047': //  # HIRAGANA LETTER SMALL E
                case '\u3049': //  # HIRAGANA LETTER SMALL O
                case '\u3063': //  # HIRAGANA LETTER SMALL TU
                case '\u3083': //  # HIRAGANA LETTER SMALL YA
                case '\u3085': //  # HIRAGANA LETTER SMALL YU
                case '\u3087': //  # HIRAGANA LETTER SMALL YO
                case '\u308E': //  # HIRAGANA LETTER SMALL WA
                case '\u3095': //  # HIRAGANA LETTER SMALL KA
                case '\u3096': //  # HIRAGANA LETTER SMALL KE
                case '\u309B': //  # KATAKANA-HIRAGANA VOICED SOUND MARK
                case '\u309C': //  # KATAKANA-HIRAGANA SEMI-VOICED SOUND MARK
                case '\u309D': //  # HIRAGANA ITERATION MARK
                case '\u309E': //  # HIRAGANA VOICED ITERATION MARK
                    return false;
                }
            }
            return true; // Hiragana (except small characters)
        }
        if (c >= '\u30A0' && c <= '\u30FF') {
            if (!includeNonStarters) {
                switch (c) {
                case '\u30A0': //  # KATAKANA-HIRAGANA DOUBLE HYPHEN
                case '\u30A1': //  # KATAKANA LETTER SMALL A
                case '\u30A3': //  # KATAKANA LETTER SMALL I
                case '\u30A5': //  # KATAKANA LETTER SMALL U
                case '\u30A7': //  # KATAKANA LETTER SMALL E
                case '\u30A9': //  # KATAKANA LETTER SMALL O
                case '\u30C3': //  # KATAKANA LETTER SMALL TU
                case '\u30E3': //  # KATAKANA LETTER SMALL YA
                case '\u30E5': //  # KATAKANA LETTER SMALL YU
                case '\u30E7': //  # KATAKANA LETTER SMALL YO
                case '\u30EE': //  # KATAKANA LETTER SMALL WA
                case '\u30F5': //  # KATAKANA LETTER SMALL KA
                case '\u30F6': //  # KATAKANA LETTER SMALL KE
                case '\u30FB': //  # KATAKANA MIDDLE DOT
                case '\u30FC': //  # KATAKANA-HIRAGANA PROLONGED SOUND MARK
                case '\u30FD': //  # KATAKANA ITERATION MARK
                case '\u30FE': //  # KATAKANA VOICED ITERATION MARK
                    return false;
                }
            }
            return true; // Katakana (except small characters)
        }
        if (c >= '\u3400' && c <= '\u4DB5') {
            return true; // CJK UNIFIED IDEOGRAPHS EXTENSION A
        }
        if (c >= '\u4E00' && c <= '\u9FBB') {
            return true; // CJK UNIFIED IDEOGRAPHS
        }
        if (c >= '\uF900' && c <= '\uFAD9') {
            return true; // CJK COMPATIBILITY IDEOGRAPHS
        }
        if (c >= '\uA000' && c <= '\uA48F') {
            return true; // YI SYLLABLES
        }
        if (c >= '\uA490' && c <= '\uA4CF') {
            return true; // YI RADICALS
        }
        if (c >= '\uFE62' && c <= '\uFE66') {
            return true; // SMALL PLUS SIGN to SMALL EQUALS SIGN
        }
        if (c >= '\uFF10' && c <= '\uFF19') {
            return true; // WIDE DIGITS
        }

        return false;
    }

/*
    private static void dump(byte[] data, int count, String label) {
        if (false) {
            System.out.print(label);

            for (int i = 0; i < count; i++)
                System.out.print(" " + data[i]);

            System.out.println();
        }
    }
*/

    int getFit(TextPaint paint,
                              TextPaint workPaint,
                       SpannableStringBuilder text, int start, int end,
                       float wid) {
        int high = end + 1, low = start - 1, guess;

        while (high - low > 1) {
            guess = (high + low) / 2;

            if (measureText(paint, workPaint,
                            text, start, guess, null, true, null) > wid)
                high = guess;
            else
                low = guess;
        }

        if (low < start)
            return start;
        else
            return low;
    }

    int idealByteArraySize(int need) {
        for (int i = 4; i < 32; i++)
            if (need <= (1 << i) - 12)
                return (1 << i) - 12;
    
        return need;
    }
    
    int idealIntArraySize(int need) {
        return idealByteArraySize(need * 4) / 4;
    }
    
    int idealCharArraySize(int need) {
        return idealByteArraySize(need * 2) / 2;
    }

    int out(SpannableStringBuilder text, int start, int end,
                      int above, int below, int top, int bottom, int v,
                      float spacingmult, float spacingadd,
                      boolean tab,
                      boolean needMultiply, boolean last,
                      boolean trackpad) {
        int j = mLineCount;
        int off = j * COLUMNS_NORMAL;
        int want = off + COLUMNS_NORMAL + TOP;
        int[] lines = mLines;

        // Log.e("text", "line " + start + " to " + end + (last ? "===" : ""));

        if (want >= lines.length) {
            int nlen = idealIntArraySize(want + 1);
            int[] grow = new int[nlen];
            System.arraycopy(lines, 0, grow, 0, lines.length);
            if(mLines != null)
            {
                delete[] mLines;
                mLines = null;
            }
            mLines = grow;
            lines = grow;
        }

        if (j == 0) {
            if (trackpad) {
                mTopPadding = top - above;
            }
        }
        if (last) {
            if (trackpad) {
                mBottomPadding = bottom - below;
            }
        }

        int extra;

        if (needMultiply) {
            double ex = (below - above) * (spacingmult - 1) + spacingadd;
            if (ex >= 0) {
                extra = (int)(ex + 0.5);
            } else {
                extra = -(int)(-ex + 0.5);
            }
        } else {
            extra = 0;
        }

        lines[off + START] = start;
        lines[off + TOP] = v;
        lines[off + DESCENT] = below + extra;

        v += (below - above) + extra;
        lines[off + COLUMNS_NORMAL + START] = end;
        lines[off + COLUMNS_NORMAL + TOP] = v;

        if (tab)
            lines[off + TAB] |= TAB_MASK;

        mLineCount++;
        return v;
    }

    // Override the baseclass so we can directly access our members,
    // rather than relying on member functions.
    // The logic mirrors that of Layout.getLineForVertical
    // FIXME: It may be faster to do a linear search for layouts without many lines.
    int getLineForVertical(int vertical) {
        int high = mLineCount;
        int low = -1;
        int guess;
        int[] lines = mLines;
        while (high - low > 1) {
            guess = (high + low) >> 1;
            if (lines[COLUMNS_NORMAL * guess + TOP] > vertical){
                high = guess;
            } else {
                low = guess;
            }
        }
        if (low < 0) {
            return 0;
        } else {
            return low;
        }
    }

    int getLineCount() {
        return mLineCount;
    }

    int getLineTop(int line) {
        return mLines[COLUMNS_NORMAL * line + TOP];    
    }

    int getLineDescent(int line) {
        return mLines[COLUMNS_NORMAL * line + DESCENT];   
    }

    int getLineStart(int line) {
        return mLines[COLUMNS_NORMAL * line + START] & START_MASK;
    }

    boolean getLineContainsTab(int line) {
        return (mLines[COLUMNS_NORMAL * line + TAB] & TAB_MASK) != 0;
    }

    int getTopPadding() {
        return mTopPadding;
    }

    int getBottomPadding() {
        return mBottomPadding;
    }

     int getTextWidths(TextPaint paint,
                                     TextPaint workPaint,
                                     Spanned text, int start, int end,
                                     float[] widths) {
         MetricAffectingSpan[] spans =
             text.getSpans(start, end, MetricAffectingSpan.class);
     
         ReplacementSpan replacement = null;
         workPaint.set(paint);
         
         for (int i = 0; i < spans.length; i++) {
             MetricAffectingSpan span = spans[i];
             if (span instanceof ReplacementSpan) {
                 replacement = (ReplacementSpan)span;
             }
             else {
                 span.updateMeasureState(workPaint);
             }
         }
     
         if (replacement == null) {
             workPaint.getTextWidths(text, start, end, widths);
         } else {
             int wid = replacement.getSize(workPaint, text, start, end);
     
             if (end > start) {
                 widths[0] = wid;
                 for (int i = start + 1; i < end; i++)
                     widths[i - start] = 0;
             }
         }
         return end - start;
     }
     
     private:

     int mLineCount;
    int mTopPadding, mBottomPadding;

    private static final int COLUMNS_NORMAL = 3;
    private static final int START = 0;
    private static final int TAB = START;
    private static final int TOP = 1;
    private static final int DESCENT = 2;

    int[] mLines;

    private static final int START_MASK = 0x1FFFFFFF;
    private static final int TAB_MASK   = 0x20000000;

    /*
     * These are reused across calls to generate()
     */
    char[] mChs;
    float[] mWidths;
}

