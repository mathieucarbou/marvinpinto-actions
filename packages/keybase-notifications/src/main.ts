import * as core from '@actions/core';
import * as github from '@actions/github';
import {generateChatMessage} from './githubEvent';
import Keybase from './keybase';
import {get} from 'lodash';

export async function main() {
  try {
    const context = github.context;
    const keybaseUsername: string = core.getInput('keybase_username', {required: true});
    const keybasePaperKey: string = core.getInput('keybase_paper_key', {required: true});

    const keybaseChannel: string = core.getInput('keybase_channel');
    const keybaseTeamName: string = core.getInput('keybase_team_name');
    const keybaseTopicName: string = core.getInput('keybase_topic_name');

    // Initialize the Keybase instance
    const kb = new Keybase(keybaseUsername, keybasePaperKey);
    await kb.init();

    // Attempt to determine the user's keybase username
    const githubUsername = get(context, 'payload.sender.login', '');
    const associatedKeybaseUsername = await kb.getKeybaseUsername(githubUsername);

    const chatMessage: string = generateChatMessage({context, keybaseUsername: associatedKeybaseUsername});
    await kb.sendChatMessage({
      teamInfo: {
        channel: keybaseChannel,
        teamName: keybaseTeamName,
        topicName: keybaseTopicName,
      },
      message: chatMessage,
    });

    await kb.deinit();
  } catch (error) {
    core.setFailed(error.message);
    throw error;
  }
}