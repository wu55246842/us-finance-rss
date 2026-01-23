import yfinance as yf
import sys
import json

def fetch_data():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Invalid arguments"}))
        return

    mode = sys.argv[1]
    symbol = sys.argv[2] # or comma separated

    try:
        if mode == 'quote':
            tickers = symbol.split(',')
            data = yf.Tickers(symbol)
            results = []
            for ticker in tickers:
                info = data.tickers[ticker].info
                # Map to our interface or just return raw
                results.append({
                    "symbol": ticker,
                    "regularMarketPrice": info.get('regularMarketPrice', info.get('currentPrice', 0)),
                    "regularMarketChange": info.get('regularMarketChange', 0), # might calculate manually if missing
                    "regularMarketChangePercent": info.get('regularMarketChangePercent', 0) * 100 if info.get('regularMarketChangePercent') is not None else 0 # check scaling
                })
                # Note: yfinance info is sometimes slow or incomplete. 'fast_info' is better for price.
                # Let's try fast_info if available or history(period='1d')
            
            # Alternative: use download for batch? No, download is for history.
            # Tickers.info is slow.
            # Let's try to get fast price via history.
            
            # Refined approach: Use history for price to be fast and consistent
            final_results = []
            for ticker in tickers:
                t = yf.Ticker(ticker)
                # fast_info
                fi = t.fast_info
                price = fi.last_price
                prev_close = fi.previous_close
                change = price - prev_close
                pct_change = (change / prev_close) * 100 if prev_close else 0
                
                final_results.append({
                    "symbol": ticker,
                    "regularMarketPrice": price,
                    "regularMarketChange": change,
                    "regularMarketChangePercent": pct_change
                })
            
            print(json.dumps(final_results))

        elif mode == 'historical':
            # symbol is single
            # arg 3 is start date? yfinance handles start='YYYY-MM-DD'
            start_date = sys.argv[3] if len(sys.argv) > 3 else "2024-01-01"
            
            t = yf.Ticker(symbol)
            hist = t.history(start=start_date, interval="1d")
            
            # Convert to list of dicts. Timestamp is index.
            # We specifically want 'Close'.
            closes = []
            for date, row in hist.iterrows():
                closes.append({
                    "date": str(date),
                    "close": row['Close']
                })
            
            print(json.dumps(closes))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    fetch_data()
