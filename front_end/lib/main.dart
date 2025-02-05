import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(OllamaApp());
}

class OllamaApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Ollama Desktop',
      theme: ThemeData.dark(),
      home: ChatScreen(),
    );
  }
}

class ChatScreen extends StatefulWidget {
  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  String _response = "";

  Future<void> askOllama(String prompt) async {
    final url = Uri.parse("http://localhost:8000/generate");
    final client = http.Client();
    final request = http.Request('POST', url)
      ..headers['Content-Type'] = 'application/json'
      ..body = jsonEncode({"prompt": prompt});

    final streamedResponse = await client.send(request);

    if (streamedResponse.statusCode == 200) {
      final StringBuffer responseBuffer = StringBuffer();
      streamedResponse.stream.transform(utf8.decoder).listen((chunk) {
        responseBuffer.write(chunk);
      }, onDone: () {
        final responseString = responseBuffer.toString();
        print('Response String: $responseString');
        final jsonResponse = jsonDecode(responseString);
        final rawResponse = jsonResponse['raw_response'];
        final responses = rawResponse
            .split('\n')
            .map((response) {
              try {
                final jsonResponse = jsonDecode(response);
                final responseText = jsonResponse['response'];
                if (responseText.contains('<') ||
                    responseText.contains('>') ||
                    responseText.contains('ðŸ˜Š')) {
                  return null; // Ignore responses with HTML tags or ðŸ˜Š character
                }
                return responseText
                    .trim(); // Remove leading and trailing whitespace
              } catch (e) {
                print('Error parsing JSON: $e');
                return null;
              }
            })
            .where((response) => response != null && response.isNotEmpty)
            .toList();

        final responseText = responses.join(' ');
        print('Response Text: $responseText');

        setState(() {
          _response = responseText;
          print('_response: $_response');
        });
      });
    } else {
      setState(() {
        _response =
            "Error: ${streamedResponse.statusCode} ${streamedResponse.reasonPhrase}";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Ollama Chatbot")),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _controller,
              decoration: InputDecoration(
                labelText: "Ask something...",
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => askOllama(_controller.text),
              child: Text("Send"),
            ),
            SizedBox(height: 20),
            Expanded(
              child: SingleChildScrollView(
                child: Text(
                  "Response: $_response",
                  style: TextStyle(fontSize: 16, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
